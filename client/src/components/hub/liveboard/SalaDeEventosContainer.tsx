/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Layers,
    Eraser,
    Undo,
    Save,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Hand,
    MessageSquare,
    Instagram,
    Linkedin,
    Globe,
    Phone,
    HelpCircle,
    Clock,
    Mail,
    Send,
    Edit2,
    Megaphone,
    Download,
    Users,
    PenLine,
    Image as ImageIcon,
    Maximize2,
    Settings,
    Activity
} from 'lucide-react';
import Image from 'next/image';
import Whiteboard from './Whiteboard';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/lib/authService';
import { getSocketUrl, getSocketOptions } from '@/lib/socketConfig';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';

const RealisticBrush = ({ color, isActive, onClick, isMobile }: any) => (
    <button
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: isMobile ? '2px' : '4px',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
            filter: isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            flexShrink: 0
        }}
    >
        <svg width={isMobile ? "16" : "18"} height={isMobile ? "24" : "26"} viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9 2 7 5 7 9C7 11 8.5 12.5 8.5 12.5H15.5C15.5 12.5 17 11 17 9C17 5 15 2 12 2Z" fill={color} />
            <rect x="8" y="12.5" width="8" height="4" fill="#C0C0C0" stroke="#888" strokeWidth="0.5" />
            <path d="M10 16.5V28C10 29.1 10.9 30 12 30C13.1 30 14 29.1 14 28V16.5H10Z" fill="#D2B48C" stroke="#A67C52" strokeWidth="0.5" />
        </svg>
    </button>
);

const RealisticEraser = ({ isActive, onClick, isMobile }: any) => (
    <button
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: isMobile ? '2px' : '4px',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
            filter: isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            flexShrink: 0
        }}
    >
        <svg width={isMobile ? "16" : "18"} height={isMobile ? "24" : "26"} viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="4" width="12" height="24" rx="2" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1" />
            <rect x="6" y="12" width="12" height="4" fill="#2E7D32" opacity="0.8" />
            <rect x="8" y="6" width="2" height="20" fill="white" opacity="0.1" />
        </svg>
    </button>
);


interface SalaDeEventosContainerProps {
    formId: string;
    isMentor: boolean;
    mentorData: {
        name: string;
        photo: string;
        title: string;
        socialLinks?: {
            instagram?: string;
            linkedin?: string;
            website?: string;
        };
        whatsapp?: string;
    };
    eventTitle: string;
    onClose: () => void;
    primaryColor?: string;
    isMinimized?: boolean;
    onRestore?: () => void;
}

export default function SalaDeEventosContainer({
    formId,
    isMentor,
    mentorData,
    eventTitle,
    onClose,
    primaryColor = '#CFB53B',
    isMinimized = false,
    onRestore
}: SalaDeEventosContainerProps) {
    const { t } = useTranslate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'laser' | 'text' | 'select'>('pen');
    const [isDark, setIsDark] = useState(false);
    const [undoTrigger, setUndoTrigger] = useState(0);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [isParticipantAudioMuted, setIsParticipantAudioMuted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [reactions, setReactions] = useState<{ id: string, emoji: string, x: number, y: number }[]>([]);
    const [isMentorSpeaking, setIsMentorSpeaking] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const userId = authService.getCurrentUser()?.id;

    // Notify Missing Modal
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [customSubject, setCustomSubject] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
    const [showAnnouncementMenu, setShowAnnouncementMenu] = useState(false);

    const announcementsList = [
        { id: 'welcome', label: 'Boas-vindas', message: 'Bem-vindo à nossa aula em direto! Prepare o seu material, começamos em instantes. 🚀', icon: '✨', color: '#3b82f6' },
        { id: 'break', label: 'Pausa Rápida', message: 'Pausa rápida para hidratar o conhecimento. Volto em 2 minutos! ☕💧', icon: '☕', color: '#f59e0b' },
        { id: 'exercise', label: 'Mão na Massa', message: 'Momento de Exercício! Use este tempo para resolver o desafio desenhado no ecrã. ✍️', icon: '🎯', color: '#10b981' },
        { id: 'qa', label: 'Dúvidas (Q&A)', message: 'Momento de Dúvidas! Se tiver questões, levante a mão (✋) ou escreva no chat!', icon: '❓', color: '#8b5cf6' },
        { id: 'focus', label: 'Foco Total', message: 'Foco Absoluto! Desligue as notificações e mergulhe no conteúdo agora. 🛡️', icon: '🛡️', color: '#ef4444' },
    ];

    // Page Management
    const [pages, setPages] = useState<{ history: any[], backgroundImage: string | null }[]>([{ history: [], backgroundImage: null }]);
    const [currentPage, setCurrentPage] = useState(0);

    // Chat
    const [messages, setMessages] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const whiteboardRef = useRef<any>(null);
    const isAudioActiveRef = useRef(false);
    const nextAudioStartTimeRef = useRef(0);

    // Quiz State
    const [showQuizCreator, setShowQuizCreator] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<any>(null);
    const [quizResults, setQuizResults] = useState<number[]>([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isQuizRevealed, setIsQuizRevealed] = useState(false);
    const [correctQuizOption, setCorrectQuizOption] = useState<number | null>(null);
    const [quizDetailedResults, setQuizDetailedResults] = useState<any[]>([]);
    const [customAnnouncementText, setCustomAnnouncementText] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    // Timer & Cursor State
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [mentorCursorPos, setMentorCursorPos] = useState<{ x: number, y: number } | null>(null);
    const [showTimerSelector, setShowTimerSelector] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Collaborative Drawing & Voice Permissions
    const [drawingPermissions, setDrawingPermissions] = useState<Set<string>>(new Set());
    const [micPermissions, setMicPermissions] = useState<Set<string>>(new Set());
    const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
    const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
    const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());
    const [isMutingAll, setIsMutingAll] = useState(false);
    const [showAudioTest, setShowAudioTest] = useState(false);
    const [testMicLevel, setTestMicLevel] = useState(0);
    const [isTestingSpeakers, setIsTestingSpeakers] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleInteraction = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            } else if (!audioContextRef.current) {
                // Pre-initialize on first click if not exist
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    // ─── Sound Effects (Web Audio API tone synthesis) ──────────────────────────
    const playSound = useCallback((type: 'timer_end' | 'hand_raised' | 'reaction') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'timer_end') {
                // Three gentle ascending tones
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);        // C5
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15); // E5
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.30); // G5
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.7);
            } else if (type === 'hand_raised') {
                // A soft "ding"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);  // A5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            } else if (type === 'reaction') {
                // A very subtle pop
                osc.type = 'sine';
                osc.frequency.setValueAtTime(660, ctx.currentTime);
                gain.gain.setValueAtTime(0.07, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            }
            // Auto-close context after sound finishes
            setTimeout(() => ctx.close(), 1500);
        } catch {
            // Silently ignore if AudioContext not available
        }
    }, []);

    useEffect(() => {
        const newSocket = io(getSocketUrl(), getSocketOptions());

        newSocket.on('connect', () => {
            console.log('[Sala de Eventos] Connected to socket');
            (window as any).__liveBoardSocketId = newSocket.id;
            newSocket.emit('live_board:join', formId);
        });

        newSocket.on('live_board:hand_raised', ({ socketId, userData }: any) => {
            if (isMentor) {
                if (socketId) {
                    setRaisedHands(prev => {
                        const next = new Set(prev);
                        next.add(socketId);
                        return next;
                    });
                    // Store userData keyed by socketId so we can show names
                    setParticipants(prev => {
                        // update in place so name is visible even outside sidebar
                        return prev.map(p => p.socketId === socketId ? { ...p, _handRaised: true } : p);
                    });
                }

                playSoundRef.current('hand_raised');
                toast(tRef.current('hub.salaDeEventos.handRaisedToast', { name: userData.name }), {
                    description: "O participante tem uma pergunta.",
                    action: {
                        label: "Ok",
                        onClick: () => console.log("Hand raise acknowledged")
                    }
                });
            }
        });

        newSocket.on('live_board:hand_lowered', ({ socketId }: any) => {
            // Mentor view: remove from raisedHands set
            if (isMentor && socketId) {
                setRaisedHands(prev => {
                    const next = new Set(prev);
                    next.delete(socketId);
                    return next;
                });
                setParticipants(prev => prev.map(p => p.socketId === socketId ? { ...p, _handRaised: false } : p));
            }
            // Participant view: if the mentor dismissed MY hand, reset it
            if (!isMentor && socketId === newSocket.id) {
                setIsHandRaised(false);
            }
        });

        newSocket.on('live_board:participants', (list: any[]) => {
            console.log('[Sala de Eventos] Participants updated:', list);
            setParticipants(list);
        });

        newSocket.on('live_board:audio_data', (payload: any) => {
            if (!isParticipantAudioMutedRef.current) {
                playAudioChunk(payload);
            }
        });

        newSocket.on('live_board:reaction', (data: any) => {
            const id = Math.random().toString(36).substr(2, 9);
            setReactions(prev => [...prev, { ...data, id }]);
            playSoundRef.current('reaction');
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 3000);
        });

        newSocket.on('live_board:mentor_audio_status', ({ isActive }: { isActive: boolean }) => {
            setIsMentorSpeaking(isActive);
        });

        newSocket.on('live_board:audio_status', ({ socketId, isActive }: { socketId: string, isActive: boolean }) => {
            setSpeakingParticipants(prev => {
                const next = new Set(prev);
                if (isActive) next.add(socketId);
                else next.delete(socketId);
                return next;
            });
        });

        newSocket.on('live_board:status', (status: any) => {
            if (status.pages && !isMentor) {
                setPages(status.pages);
                setCurrentPage(status.currentPage || 0);
            }
            if (status.currentQuiz) {
                setCurrentQuiz(status.currentQuiz);
                setQuizResults(status.results || []);
                const myVote = status.currentQuiz.votes?.find(([id]: any) => id === userId?.toString());
                if (myVote) {
                    setHasVoted(true);
                    setSelectedOption(myVote[1]);
                }
            }
            if (status.currentTimer && status.currentTimer.remaining > 0) {
                setTimerSeconds(status.currentTimer.remaining);
                setIsTimerActive(true);
            }
            if (status.currentAnnouncement) {
                setCurrentAnnouncement(status.currentAnnouncement);
            }
            if (status.isMentorSpeaking !== undefined) {
                setIsMentorSpeaking(status.isMentorSpeaking);
            }
        });

        newSocket.on('live_board:mic_permission', ({ granted, socketId }: { granted: boolean, socketId: string }) => {
            const myId = (window as any).__liveBoardSocketId;
            const isMe = socketId === myId;

            if (isMe) {
                if (granted) {
                    toast.success('🎙️ O mentor abriu o seu microfone! Você já pode falar.');
                } else {
                    toast.error('O mentor fechou o seu microfone.');
                    handleStopAudio();
                }

                setMicPermissions(prev => {
                    const next = new Set(prev);
                    if (granted) next.add(myId);
                    else next.delete(myId);
                    return next;
                });
            } else if (isMentor) {
                // If I am mentor, I should update my local state for this participant
                setMicPermissions(prev => {
                    const next = new Set(prev);
                    if (granted) next.add(socketId);
                    else next.delete(socketId);
                    return next;
                });
            }
        });

        newSocket.on('live_board:mute_all', () => {
            if (!isMentor) {
                handleStopAudio();
                toast.info('🔇 O mentor mutou todos os microfones.', { duration: 4000 });
            }
        });

        newSocket.on('live_board:timer:start', ({ duration }: any) => {
            setTimerSeconds(duration);
            setIsTimerActive(true);
        });

        newSocket.on('live_board:drawing_permission', ({ socketId, granted }: { socketId: string, granted: boolean }) => {
            setDrawingPermissions(prev => {
                const next = new Set(prev);
                if (granted) next.add(socketId);
                else next.delete(socketId);
                return next;
            });
            if (!isMentor) {
                if (granted) {
                    toast.success('✏️ O Mentor deu-te permissão para desenhar!', { duration: 4000 });
                } else {
                    toast.info('O mentor retirou a tua permissão de desenho.');
                }
            }
        });

        newSocket.on('live_board:my_socket_id', (id: string) => {
            // Store our own socket ID so participant knows if they have permission
            // This is already set on 'connect', but can be a fallback if needed.
            (window as any).__liveBoardSocketId = id;
        });

        newSocket.on('live_board:timer:stop', () => {
            setIsTimerActive(false);
            setTimerSeconds(0);
        });

        newSocket.on('live_board:announcement', (data: any) => {
            setCurrentAnnouncement(data);
        });

        newSocket.on('live_board:announcement:clear', () => {
            setCurrentAnnouncement(null);
        });

        newSocket.on('live_board:cursor:move', (pos: { x: number, y: number }) => {
            if (!isMentor) {
                setMentorCursorPos(pos);
            }
        });

        newSocket.on('live_board:notify_missing:success', ({ count, total }: any) => {
            setIsNotifying(false);
            toast.success(`E-mails enviados com sucesso para ${count} de ${total} participantes ausentes!`);
        });

        newSocket.on('live_board:notify_missing:info', (msg: string) => {
            setIsNotifying(false);
            toast.info(msg);
        });

        newSocket.on('live_board:notify_missing:error', (msg: string) => {
            setIsNotifying(false);
            toast.error(msg);
        });

        newSocket.on('live_board:quiz_start', (quiz: any) => {
            setCurrentQuiz(quiz);
            setQuizResults(new Array(quiz.options.length).fill(0));
            setHasVoted(false);
            setSelectedOption(null);
            setIsQuizRevealed(false);
            setCorrectQuizOption(null);
        });

        newSocket.on('live_board:quiz_results', ({ results }: any) => {
            setQuizResults(results);
        });

        newSocket.on('live_board:quiz_reveal', ({ correctOption }: any) => {
            setIsQuizRevealed(true);
            setCorrectQuizOption(correctOption);
            toast(tRef.current('hub.salaDeEventos.quizRevealedToast') || "Resposta revelada!");
        });

        newSocket.on('live_board:quiz_end', () => {
            setCurrentQuiz(null);
            setShowQuizCreator(false);
            setQuizDetailedResults([]);
        });

        newSocket.on('live_board:quiz_detailed_results', (detailed: any[]) => {
            setQuizDetailedResults(detailed);
        });

        newSocket.on('live_board:page_change', ({ index, pages: syncedPages }: any) => {
            if (!isMentor) {
                setCurrentPage(index);
                if (syncedPages) setPages(syncedPages);
            }
        });

        newSocket.on('live_board:action', (action: string) => {
            if (action === 'clear' && !isMentor) {
                // Not needed here, Whiteboard component listens to this, but we could handle it globally.
            }
        });

        newSocket.on('live_board:message', (msg: any) => {
            setMessages(prev => [...prev, msg]);

            // Only increment unread count if sidebar is closed and message is not from ME
            const isMe = msg.userData?.id === authService.getCurrentUser()?.id;
            if (!isMe) {
                setUnreadCount(prev => prev + 1);
                // We'll also use this to trigger a small toast or sound if needed
                if (window.innerWidth > 768) { // Only sound on desktop to avoid mobile spam
                    playSoundRef.current('reaction'); // reuse a light sound
                }
            }

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formId, isMentor, userId]); // Removed volatile dependencies to prevent frequent reconnections

    const playAudioChunk = async (payload: any) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        try {
            const { data, sampleRate } = payload;
            let floatData: Float32Array;

            if (data instanceof Float32Array) {
                floatData = data;
            } else if (data instanceof ArrayBuffer) {
                floatData = new Float32Array(data);
            } else {
                const buffer = data.buffer || data;
                const offset = data.byteOffset || 0;
                const length = data.byteLength || data.length;
                floatData = new Float32Array(buffer, offset, length / 4);
            }

            const context = audioContextRef.current;
            const audioBuffer = context.createBuffer(1, floatData.length, sampleRate || context.sampleRate);
            audioBuffer.getChannelData(0).set(floatData);

            const source = context.createBufferSource();
            source.buffer = audioBuffer;

            // Anti-jitter buffering: 
            // We schedule the start time to be exactly after the last chunk finished.
            const currentTime = context.currentTime;
            const spacing = 0.05; // 50ms initial safety buffer to handle network jitter

            if (nextAudioStartTimeRef.current < currentTime) {
                nextAudioStartTimeRef.current = currentTime + spacing;
            }

            source.connect(context.destination);
            source.start(nextAudioStartTimeRef.current);

            // Advance the next start time by the duration of the current chunk
            nextAudioStartTimeRef.current += audioBuffer.duration;

        } catch (e) {
            console.warn("[LiveBoard Audio] Play error:", e);
        }
    };

    useEffect(() => {
        let interval: any;
        if (isTimerActive && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        setIsTimerActive(false);
                        playSound('timer_end');
                        toast(t('hub.salaDeEventos.timerFinished') || "Tempo Esgotado! ⏰", { icon: '⏰' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timerSeconds, isMentor, t, playSound]);

    const handleStartAudio = useCallback(async () => {
        try {
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

            // Using ScriptProcessor (legacy but reliable for small PCM chunks)
            // Ideally we'd use AudioWorklet, but ScriptProcessor is more drop-in for this container.
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const context = audioContextRef.current;
            if (context.state === 'suspended') await context.resume();

            const source = context.createMediaStreamSource(stream);
            // Reduced to 2048 for lower latency, but keeps stability
            const processor = context.createScriptProcessor(2048, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert to Float32Array to send
                if (socket && isAudioActiveRef.current) {
                    socket.emit('live_board:audio_stream', {
                        formId,
                        data: inputData.buffer,
                        sampleRate: context.sampleRate
                    });
                }
            };

            (window as any).__audioStream = stream;
            (window as any).__audioProcessor = processor;
            (window as any).__audioSource = source;

            setIsAudioActive(true);
            isAudioActiveRef.current = true;

            if (isMentor) {
                socket?.emit('live_board:mentor_audio_status', { formId, isActive: true });
            } else {
                socket?.emit('live_board:audio_status', { formId, isActive: true });
            }

            toast.success(t('hub.salaDeEventos.audioEnabled'));
        } catch (err: any) {
            console.error("Microphone error:", err);
            toast.error("Erro ao acessar microfone.");
        }
    }, [formId, isMentor, socket, t]);

    const handleTestSpeakers = () => {
        setIsTestingSpeakers(true);
        playSound('reaction'); // Reusing the reaction sound for test or we can synthesize a specific one
        setTimeout(() => {
            playSound('hand_raised');
            setTimeout(() => setIsTestingSpeakers(false), 500);
        }, 500);
    };

    useEffect(() => {
        let testMicInterval: any;
        let testAnalyser: AnalyserNode | null = null;
        let testStream: MediaStream | null = null;

        if (showAudioTest) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                testStream = stream;
                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                const source = context.createMediaStreamSource(stream);
                testAnalyser = context.createAnalyser();
                testAnalyser.fftSize = 256;
                source.connect(testAnalyser);

                const dataArray = new Uint8Array(testAnalyser.frequencyBinCount);
                testMicInterval = setInterval(() => {
                    if (testAnalyser) {
                        testAnalyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                        setTestMicLevel(average / 1.28); // normalize to roughly 0-100
                    }
                }, 50);
            }).catch(err => {
                console.error("Test mic error:", err);
                toast.error("Erro ao acessar mic para teste.");
            });
        } else {
            setTestMicLevel(0);
        }

        return () => {
            clearInterval(testMicInterval);
            if (testStream) {
                testStream.getTracks().forEach(t => t.stop());
            }
        };
    }, [showAudioTest]);

    const handleStopAudio = useCallback(() => {
        isAudioActiveRef.current = false;
        setIsAudioActive(false);

        if ((window as any).__audioStream) {
            (window as any).__audioStream.getTracks().forEach((track: any) => track.stop());
            (window as any).__audioStream = null;
        }

        if ((window as any).__audioProcessor) {
            (window as any).__audioProcessor.disconnect();
            (window as any).__audioProcessor = null;
        }

        if ((window as any).__audioSource) {
            (window as any).__audioSource.disconnect();
            (window as any).__audioSource = null;
        }

        if (isMentor) {
            socket?.emit('live_board:mentor_audio_status', { formId, isActive: false });
        } else {
            socket?.emit('live_board:audio_status', { formId, isActive: false });
        }
    }, [formId, isMentor, socket]);

    const handleRaiseHand = () => {
        if (!socket) return;
        if (isHandRaised) {
            socket.emit('live_board:lower_hand', { formId, userData: authService.getCurrentUser() });
            setIsHandRaised(false);
        } else {
            socket.emit('live_board:raise_hand', { formId, userData: authService.getCurrentUser() });
            setIsHandRaised(true);
            playSound('hand_raised');
            toast.success(t('hub.salaDeEventos.handRaisedSuccess'));
        }
    };

    const mentorLowerHand = (participantSocketId: string) => {
        if (!socket || !isMentor) return;
        socket.emit('live_board:hand_lower', { formId, participantSocketId });
        setRaisedHands(prev => {
            const next = new Set(prev);
            next.delete(participantSocketId);
            return next;
        });
    };
    const toggleMicPermission = (participantSocketId: string) => {
        if (!socket || !isMentor) return;
        const hasPermission = micPermissions.has(participantSocketId);
        socket.emit('live_board:mic_permission', {
            formId,
            socketId: participantSocketId,
            granted: !hasPermission
        });
        // We update locally as well for immediate UI feedback
        setMicPermissions(prev => {
            const next = new Set(prev);
            if (hasPermission) next.delete(participantSocketId);
            else next.add(participantSocketId);
            return next;
        });

        toast.success(
            hasPermission
                ? 'Microfone do participante fechado.'
                : '🎙️ Microfone do participante aberto!'
        );
    };

    const toggleDrawingPermission = (participantSocketId: string) => {
        if (!socket || !isMentor) return;
        const hasPermission = drawingPermissions.has(participantSocketId);
        socket.emit('live_board:drawing_permission', {
            formId,
            socketId: participantSocketId,
            granted: !hasPermission
        });
        setDrawingPermissions(prev => {
            const next = new Set(prev);
            if (hasPermission) next.delete(participantSocketId);
            else next.add(participantSocketId);
            return next;
        });
        toast.success(
            hasPermission
                ? 'Permissão de desenho removida.'
                : '✏️ Permissão de desenho concedida!'
        );
    };

    const grantAllDrawingPermissions = () => {
        if (!socket || !isMentor || participants.length === 0) return;
        participants.forEach(p => {
            if (!drawingPermissions.has(p.socketId)) {
                socket.emit('live_board:drawing_permission', {
                    formId,
                    socketId: p.socketId,
                    granted: true
                });
            }
        });
        setDrawingPermissions(new Set(participants.map(p => p.socketId)));
        toast.success('✏️ Todos os participantes podem desenhar!');
    };

    const revokeAllDrawingPermissions = () => {
        if (!socket || !isMentor) return;
        drawingPermissions.forEach(socketId => {
            socket.emit('live_board:drawing_permission', {
                formId,
                socketId,
                granted: false
            });
        });
        setDrawingPermissions(new Set());
        toast.info('Permissões de desenho revogadas para todos.');
    };

    const handleExportBoard = () => {
        const fullBoardDataUrl = whiteboardRef.current?.getFullBoardDataURL();
        if (!fullBoardDataUrl) {
            toast.error('Não foi possível capturar o quadro.');
            return;
        }

        const img = new window.Image();
        img.onload = () => {
            const tmp = document.createElement('canvas');
            tmp.width = img.width;
            tmp.height = img.height;
            const tmpCtx = tmp.getContext('2d')!;
            tmpCtx.drawImage(img, 0, 0);

            // Watermark text
            const wm = 'inscreva-se.com';
            tmpCtx.font = `bold ${Math.max(16, tmp.width * 0.018)}px Inter, sans-serif`;
            tmpCtx.fillStyle = 'rgba(0,0,0,0.18)';
            tmpCtx.textAlign = 'right';
            tmpCtx.textBaseline = 'bottom';
            tmpCtx.fillText(wm, tmp.width - 18, tmp.height - 16);

            const link = document.createElement('a');
            link.download = `sala-eventos-${formId}-${Date.now()}.png`;
            link.href = tmp.toDataURL('image/png');
            link.click();
            toast.success('📸 Screenshot guardado com sucesso!');
        };
        img.src = fullBoardDataUrl;
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

    const handleCursorMove = (e: React.MouseEvent) => {
        if (isMentor && socket) {
            const rect = whiteboardContainerRef.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                socket.emit('live_board:cursor:move', { formId, x, y });
            }
        }
    };

    const handleNotifyMissing = () => {
        if (!socket || !isMentor) return;
        setCustomSubject(`🚀 O evento "${eventTitle}" começou!`);
        setCustomMessage(`O evento ${eventTitle} com ${mentorData.name} já começou e estamos à sua espera!\n\nNão perca os conteúdos exclusivos, a interatividade da Sala de Eventos e a oportunidade de tirar dúvidas em tempo real.`);
        setShowNotifyModal(true);
    };

    const confirmNotifyMissing = () => {
        if (!socket || !isMentor) return;
        setIsNotifying(true);
        setShowNotifyModal(false);
        socket.emit('live_board:notify_missing', {
            formId,
            customSubject,
            customText: customMessage
        });
        toast.loading("A enviar notificações personalizadas...");
    };

    const handleAnnouncement = (ann: any) => {
        if (!socket || !isMentor) return;
        socket.emit('live_board:announcement', {
            formId,
            message: ann.message,
            type: ann.id
        });
        setShowAnnouncementMenu(false);
    };

    const clearAnnouncement = () => {
        if (!socket || !isMentor) return;
        socket.emit('live_board:announcement:clear', formId);
    };

    const whiteboardContainerRef = useRef<HTMLDivElement>(null);

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && isMentor) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;

                // Instead of a fixed background, we add it as a movable image object
                const data = {
                    type: 'image',
                    src: base64,
                    x0: 0.1,
                    y0: 0.1,
                    x1: 0.5, // Default width 0.4
                    y1: 0.5, // Default height 0.4
                    strokeId: Math.random().toString(36).substring(7),
                };

                // Add to local history and sync
                whiteboardRef.current?.addExternalItem(data);
                socket?.emit('live_board:draw', { formId, data });

                // Clear the static background image property if we want it to be object-only
                const newPages = [...pages];
                newPages[currentPage].backgroundImage = null;
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
        handleExportBoard();
    };

    if (!socket) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="live-board-main"
            onClick={isMinimized && onRestore ? onRestore : undefined}
            onMouseEnter={() => isMinimized && setIsHovered(true)}
            onMouseLeave={() => isMinimized && setIsHovered(false)}
            style={isMinimized ? {
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: isMobile ? '180px' : '320px',
                height: isMobile ? '101px' : '180px',
                background: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(24px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '28px',
                boxShadow: isHovered
                    ? `0 35px 70px -15px rgba(0, 0, 0, 0.6), 0 0 40px ${primaryColor}4D`
                    : '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
                outline: isHovered ? `2.5px solid ${primaryColor}` : `1px solid ${primaryColor}4D`,
                outlineOffset: '-2px',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isHovered ? 'scale(1.08) translateY(-12px)' : 'scale(1) translateY(0)',
                backgroundImage: isDark ? 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)' : 'radial-gradient(circle at 10% 20%, rgba(0,0,0,0.01) 0%, transparent 60%)'
            } : {
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
                color: isDark ? '#fff' : '#111',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
        >
            {/* Minimal Top Header */}
            {isMinimized ? (
                <div style={{
                    padding: '0 16px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexShrink: 0,
                    zIndex: 100,
                    height: '36px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            background: primaryColor,
                            borderRadius: '50%',
                            boxShadow: `0 0 10px ${primaryColor}`
                        }} />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: isDark ? '#fff' : '#111',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            letterSpacing: '-0.2px'
                        }}>
                            {eventTitle}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        color: isDark ? '#fff' : '#111',
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(100,100,100,0.1)',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontFamily: 'monospace'
                    }}>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: isMobile ? '8px 12px' : '10px 25px',
                    background: isDark ? '#1a1a1a' : '#fff',
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: isMobile ? '50px' : '65px',
                    backdropFilter: 'blur(10px)',
                    zIndex: 100
                }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: isMobile ? '10px' : '15px', overflow: 'hidden' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${primaryColor}`, flexShrink: 0 }}>
                                <Image
                                    src={mentorData.photo || '/default-avatar.png'}
                                    width={isMobile ? 30 : 36}
                                    height={isMobile ? 30 : 36}
                                    style={{ objectFit: 'cover' }}
                                    alt={mentorData.name}
                                />
                            </div>
                            {(isMentor ? isAudioActive : isMentorSpeaking) && (
                                <motion.div
                                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.2, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{
                                        position: 'absolute',
                                        inset: -3,
                                        borderRadius: '12px',
                                        border: `2px solid ${primaryColor}`,
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}
                            {(isMentor ? isAudioActive : isMentorSpeaking) && (
                                <div style={{ position: 'absolute', bottom: -1, right: -1, background: primaryColor, borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', gap: '1px' }}>
                                    <motion.div animate={{ height: [3, 7, 3] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ width: '1.5px', background: '#fff' }} />
                                    <motion.div animate={{ height: [2, 5, 2] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} style={{ width: '1.5px', background: '#fff' }} />
                                    <motion.div animate={{ height: [3, 7, 3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '1.5px', background: '#fff' }} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: isMobile ? '0.85rem' : '0.95rem', color: isDark ? '#fff' : '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '80px' : 'none' }}>{mentorData.name}</div>
                            {!isMobile && (
                                <>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {mentorData.title}
                                        {isMentorSpeaking && (
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                style={{ color: primaryColor, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}
                                            >
                                                • Falando
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Social Links & Contact */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                        {mentorData.socialLinks?.instagram && (
                                            <a href={mentorData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#fff' : '#111', opacity: 0.5 }}>
                                                <Instagram size={14} />
                                            </a>
                                        )}
                                        {mentorData.socialLinks?.linkedin && (
                                            <a href={mentorData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#fff' : '#111', opacity: 0.5 }}>
                                                <Linkedin size={14} />
                                            </a>
                                        )}
                                        {mentorData.socialLinks?.website && (
                                            <a href={mentorData.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#fff' : '#111', opacity: 0.5 }}>
                                                <Globe size={14} />
                                            </a>
                                        )}
                                        {mentorData.whatsapp && (
                                            <a href={`https://wa.me/${mentorData.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#fff' : '#111', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                                <Phone size={14} />
                                                <span style={{ fontSize: '0.7rem' }}>{mentorData.whatsapp}</span>
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Date and Time Header Center */}
                    {!isMobile && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isDark ? '#fff' : '#111',
                            opacity: 0.8,
                            flexShrink: 0,
                            padding: '0 15px'
                        }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                                {currentTime.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                {currentTime.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'short' }).replace('.', '')}
                            </div>
                        </div>
                    )}

                    {/* Currently Speaking (Participants) - HEADER */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '20px' }}>
                        <AnimatePresence>
                            {participants.filter(p => speakingParticipants.has(p.socketId)).map(p => (
                                <motion.div
                                    key={`speaking-${p.socketId}`}
                                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: '1.5px solid rgba(34, 197, 94, 0.3)',
                                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.15)'
                                    }}
                                >
                                    <div style={{ position: 'relative', width: '24px', height: '24px', flexShrink: 0 }}>
                                        <Image src={p.photo || '/default-avatar.png'} width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #22c55e' }} alt="" />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            style={{ position: 'absolute', bottom: -1, right: -1, background: '#22c55e', borderRadius: '50%', width: '10px', height: '10px', border: '1.5px solid #fff' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#166534', letterSpacing: '0.3px' }}>{p.name.split(' ')[0]}</span>
                                        <div style={{ display: 'flex', gap: '2px', height: '8px', alignItems: 'flex-end', marginTop: '2px' }}>
                                            {[0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [2, 8, 2] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                                                    style={{ width: '2px', background: '#22c55e', borderRadius: '1px' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: isMobile ? '8px' : '20px' }}>
                        {/* Participant Avatars (Overlap Style like Google Meet) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: isMobile ? '0' : '10px' }}>
                            {!isMobile && participants.slice(0, 5).map((p, idx) => (
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
                            {!isMobile && participants.length > 5 && (
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
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>+{participants.length - 5}</span>
                                </div>
                            )}

                            {/* Raised Hands Indicator for Mentor - HEADER */}
                            {isMentor && raisedHands.size > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginLeft: '15px', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '400px', scrollbarWidth: 'none' }}>
                                    <AnimatePresence>
                                        {participants.filter(p => raisedHands.has(p.socketId)).map(p => (
                                            <motion.div
                                                key={`header-hand-${p.socketId}`}
                                                initial={{ scale: 0, x: 20 }}
                                                animate={{ scale: 1, x: 0 }}
                                                exit={{ scale: 0, x: 20 }}
                                                onClick={() => mentorLowerHand(p.socketId)}
                                                style={{
                                                    background: '#3b82f6',
                                                    color: '#fff',
                                                    padding: '6px 14px',
                                                    borderRadius: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 900,
                                                    boxShadow: '0 6px 15px rgba(59,130,246,0.3)',
                                                    cursor: 'pointer',
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    flexShrink: 0,
                                                    textTransform: 'uppercase'
                                                }}
                                                whileHover={{ scale: 1.05, background: '#ef4444' }}
                                                title="Clique para abaixar a mão"
                                            >
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', background: '#fff', flexShrink: 0, border: '1px solid #fff' }}>
                                                    <Image src={p.photo || '/default-avatar.png'} width={22} height={22} style={{ objectFit: 'cover' }} alt="" />
                                                </div>
                                                <span style={{ whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]} ✋</span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                            <span style={{ marginLeft: isMobile ? '0' : '12px', fontSize: '0.75rem', fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isMobile && <Users size={14} />}
                                {participants.length} {!isMobile && (participants.length === 1 ? 'conetado' : 'conectados')}
                            </span>
                        </div>

                        {isTimerActive && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: timerSeconds < 10 ? '#fee2e2' : (isDark ? 'rgba(14,165,233,0.1)' : '#f0f9ff'),
                                padding: '6px 14px',
                                borderRadius: '12px',
                                color: timerSeconds < 10 ? '#ef4444' : '#0ea5e9',
                                fontWeight: 900,
                                fontSize: '0.9rem',
                                border: `1px solid ${timerSeconds < 10 ? '#fecaca' : '#bae6fd'}`,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                                <Clock size={16} className={timerSeconds < 10 ? "animate-pulse" : ""} />
                                <span style={{ minWidth: '45px', textAlign: 'center' }}>
                                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}

                        {isMentor && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleNotifyMissing}
                                    disabled={isNotifying}
                                    style={{
                                        background: isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4',
                                        color: '#22c55e',
                                        border: 'none',
                                        padding: isMobile ? '0 8px' : '0 12px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: isNotifying ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '0.75rem',
                                        opacity: isNotifying ? 0.6 : 1
                                    }}
                                    title="Enviar e-mail para inscritos que ainda não entraram"
                                >
                                    <Mail size={14} /> {!isMobile && "Chamar Inscritos"}
                                </button>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowTimerSelector(!showTimerSelector)}
                                        style={{
                                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
                                            color: isDark ? '#fff' : '#666',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Clock size={14} />
                                    </button>

                                    <AnimatePresence>
                                        {showTimerSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '40px',
                                                    right: 0,
                                                    background: isDark ? '#1a1a1a' : '#fff',
                                                    padding: '12px',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                    border: isDark ? '1px solid #333' : '1px solid #eee',
                                                    zIndex: 100,
                                                    width: '180px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#888', marginBottom: '4px' }}>ESTABELECER FOCO</span>
                                                {[1, 2, 5, 10, 15].map(min => (
                                                    <button
                                                        key={min}
                                                        onClick={() => {
                                                            socket?.emit('live_board:timer:start', { formId, duration: min * 60 });
                                                            setShowTimerSelector(false);
                                                        }}
                                                        style={{ padding: '8px', borderRadius: '8px', border: 'none', background: isDark ? '#333' : '#f5f5f5', color: isDark ? '#fff' : '#444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        {min} {min === 1 ? 'minuto' : 'minutos'}
                                                    </button>
                                                ))}
                                                {isTimerActive && (
                                                    <button
                                                        onClick={() => {
                                                            socket?.emit('live_board:timer:stop', formId);
                                                            setShowTimerSelector(false);
                                                        }}
                                                        style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        Parar Timer
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
                            padding: isMobile ? '4px 8px' : '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: isDark ? '#fff' : '#444'
                        }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff4757' }} className="animate-pulse" />
                            <span>SALA DE {!isMobile && "EVENTOS"}</span>
                        </div>

                        {isMentor ? (
                            <button
                                onClick={onClose}
                                style={{
                                    background: '#fee2e2',
                                    color: '#ef4444',
                                    border: 'none',
                                    padding: isMobile ? '8px' : '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <X size={14} /> {!isMobile && "Encerramento"}
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
                                    color: isDark ? '#fff' : '#444',
                                    border: 'none',
                                    padding: isMobile ? '8px' : '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <X size={16} /> {!isMobile && "Minimizar"}
                            </button>
                        )}
                    </div>
                </div>
            )}


            {/* Canvas Area */}
            <div
                ref={whiteboardContainerRef}
                onMouseMove={handleCursorMove}
                style={{ flex: 1, position: 'relative', background: '#fff' }}
            >
                <Whiteboard
                    ref={whiteboardRef}
                    isMentor={isMentor || drawingPermissions.has((window as any).__liveBoardSocketId || '')}
                    socket={socket}
                    formId={formId}
                    color={color}
                    brushSize={brushSize}
                    isEraser={tool === 'eraser'}
                    undoTrigger={undoTrigger}
                    tool={tool}
                    isDark={isDark}
                    backgroundImage={pages[currentPage]?.backgroundImage}
                    primaryColor={primaryColor}
                />

                {isMinimized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                            pointerEvents: 'none',
                            backdropFilter: isHovered ? 'blur(4px)' : 'none'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 10 }}
                            animate={{ scale: isHovered ? 1 : 0.8, y: isHovered ? 0 : 10 }}
                            style={{
                                background: primaryColor,
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '14px',
                                fontSize: '0.8rem',
                                fontWeight: 900,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: `0 15px 30px ${primaryColor}66`,
                                border: '1px solid rgba(255,255,255,0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Maximize2 size={16} strokeWidth={3} /> Maximizar
                        </motion.div>
                    </motion.div>
                )}

                {/* Mentor Cursor Overlay (for participants) */}
                {
                    !isMinimized && mentorCursorPos && !isMentor && (
                        <motion.div
                            animate={{ x: mentorCursorPos.x, y: mentorCursorPos.y }}
                            transition={{ duration: 0.1, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start'
                            }}
                        >
                            <MousePointer2
                                size={20}
                                style={{
                                    color: primaryColor,
                                    fill: primaryColor,
                                    transform: 'rotate(-25deg)',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                }}
                            />
                            <div style={{
                                background: primaryColor,
                                color: '#fff',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                marginTop: '2px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                Mentor
                            </div>
                        </motion.div>
                    )
                }
            </div > {/* Floating Reactions Render */}
            <AnimatePresence>
                {reactions.map((r) => (
                    <motion.div
                        key={r.id}
                        initial={{ y: 0, x: `${r.x}%`, opacity: 0, scale: 0.5 }}
                        animate={{ y: -400, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 1] }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            bottom: '80px',
                            left: 0,
                            pointerEvents: 'none',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {r.emoji.length > 2 ? (
                            <div style={{
                                background: r.emoji === 'Sim' ? '#22c55e' : (r.emoji === 'Não' ? '#ef4444' : primaryColor),
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: 900,
                                fontSize: '1rem',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                                border: '2px solid #fff'
                            }}>
                                {r.emoji}
                            </div>
                        ) : (
                            <span style={{ fontSize: '2.5rem' }}>{r.emoji}</span>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence >

            {/* Logo Watermark */}
            <div style={{
                position: 'absolute',
                bottom: isMinimized ? '5px' : '20px',
                left: isMinimized ? '5px' : '20px',
                pointerEvents: 'none',
                opacity: isMinimized ? 0.3 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: isMinimized ? '4px' : '8px',
                zIndex: 10
            }}>
                <Image src="/logo.png" alt="Inscreva-se" width={isMinimized ? 14 : 24} height={isMinimized ? 14 : 24} style={{ opacity: isDark ? 0.9 : 0.7, filter: isDark ? 'invert(1)' : 'none' }} />
                <span style={{ fontSize: isMinimized ? '0.45rem' : '0.65rem', fontWeight: 800, color: isDark ? '#fff' : '#000', letterSpacing: '0.5px' }}>POWERED BY INSCREVA-SE</span>
            </div>


            {/* Participant Audio Control */}
            {
                !isMinimized && (
                    <div style={{ position: 'absolute', bottom: isMobile ? 85 : 125, right: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1000 }}>
                        {/* Mentor speaking indicator for participants */}
                        <AnimatePresence>
                            {isMentorSpeaking && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                    style={{
                                        background: isDark ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${primaryColor}40`,
                                        borderRadius: '12px',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: `0 4px 20px ${primaryColor}30`,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <div style={{ background: primaryColor, borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
                                            {[0, 0.1, 0.2].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: ['4px', '12px', '4px'] }}
                                                    transition={{ repeat: Infinity, duration: 0.5, delay, ease: 'easeInOut' }}
                                                    style={{ width: '2px', background: '#fff', borderRadius: '1px' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#fff' : '#111' }}>
                                        {mentorData.name} a falar
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={() => setIsParticipantAudioMuted(!isParticipantAudioMuted)}
                            style={{
                                background: isParticipantAudioMuted ? '#111' : primaryColor,
                                color: '#fff',
                                width: isMobile ? '40px' : '46px',
                                height: isMobile ? '40px' : '46px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isParticipantAudioMuted ? <VolumeX size={isMobile ? 18 : 22} /> : <Volume2 size={isMobile ? 18 : 22} />}
                        </button>
                    </div>
                )
            }

            {/* Bottom Tools */}
            {!isMinimized && (
                <div style={{
                    position: 'absolute',
                    bottom: isMobile ? '15px' : '25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    padding: '6px 20px',
                    borderRadius: isMobile ? '12px' : '18px',
                    boxShadow: '0 12px 45px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '3px' : '5px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    zIndex: 200,
                    maxWidth: '98vw',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>

                    {(isMentor || drawingPermissions.has((window as any).__liveBoardSocketId || '')) ? (
                        <>
                            {/* Colors (Brushes) */}
                            <div style={{ display: 'flex', gap: '3px', paddingRight: '4px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0', flexShrink: 0 }}>
                                {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'].map((c) => (
                                    <RealisticBrush
                                        key={c}
                                        color={c}
                                        isActive={color === c && tool !== 'eraser'}
                                        isDark={isDark}
                                        isMobile={isMobile}
                                        onClick={() => { setColor(c); if (tool === 'eraser' || tool === 'select') setTool('pen'); }}
                                    />
                                ))}
                                <RealisticEraser
                                    isActive={tool === 'eraser'}
                                    isMobile={isMobile}
                                    onClick={() => setTool('eraser')}
                                />
                            </div>

                            {/* Main Tools */}
                            <div style={{ display: 'flex', gap: '0px', padding: '0 1px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0', flexShrink: 0 }}>
                                {[
                                    { id: 'laser', icon: <MousePointer2 size={isMobile ? 14 : 16} /> },
                                    { id: 'rectangle', icon: <Square size={isMobile ? 14 : 16} /> },
                                    { id: 'circle', icon: <CircleIcon size={isMobile ? 14 : 16} /> },
                                    { id: 'arrow', icon: <ArrowUpRight size={isMobile ? 14 : 16} /> },
                                    { id: 'text', icon: <Type size={isMobile ? 14 : 16} /> },
                                    { id: 'image', icon: <ImageIcon size={isMobile ? 14 : 16} /> }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            if (t.id === 'image') {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e: any) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re: any) => {
                                                            const img = new window.Image();
                                                            img.onload = () => {
                                                                // Create a temporary canvas for compression
                                                                const canvas = document.createElement('canvas');
                                                                const MAX_WIDTH = 1200;
                                                                const MAX_HEIGHT = 1200;
                                                                let width = img.width;
                                                                let height = img.height;

                                                                if (width > height) {
                                                                    if (width > MAX_WIDTH) {
                                                                        height *= MAX_WIDTH / width;
                                                                        width = MAX_WIDTH;
                                                                    }
                                                                } else {
                                                                    if (height > MAX_HEIGHT) {
                                                                        width *= MAX_HEIGHT / height;
                                                                        height = MAX_HEIGHT;
                                                                    }
                                                                }

                                                                canvas.width = width;
                                                                canvas.height = height;
                                                                const ctx = canvas.getContext('2d');
                                                                ctx?.drawImage(img, 0, 0, width, height);

                                                                // Compress to JPEG with 0.6 quality to keep it light
                                                                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);

                                                                // Calculate aspect ratio for initial display
                                                                // We use a fixed width of 0.3 (30%) of the board and calculate height
                                                                const displayWidth = 0.3;
                                                                const displayHeight = (img.height / img.width) * displayWidth;

                                                                const data = {
                                                                    type: 'image',
                                                                    strokeId: Math.random().toString(36).substring(7),
                                                                    src: compressedDataUrl,
                                                                    x0: 0.1, y0: 0.1,
                                                                    x1: 0.1 + displayWidth,
                                                                    y1: 0.1 + displayHeight
                                                                };
                                                                socket?.emit('live_board:draw', { formId, data });
                                                                whiteboardRef.current?.addExternalItem(data);
                                                            };
                                                            img.src = re.target.result;
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                };
                                                input.click();
                                            } else {
                                                setTool(t.id as any);
                                            }
                                        }}
                                        style={{
                                            width: isMobile ? '26px' : '30px',
                                            height: isMobile ? '26px' : '30px',
                                            borderRadius: '6px',
                                            background: tool === t.id ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0') : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: tool === t.id ? (isDark ? '#fff' : '#111') : (isDark ? '#aaa' : '#666'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }}
                                        title={t.id}
                                    >
                                        {t.icon}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setTool('pen')}
                                    style={{
                                        width: isMobile ? '28px' : '32px',
                                        height: isMobile ? '28px' : '32px',
                                        borderRadius: '6px',
                                        background: tool === 'pen' ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0') : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: tool === 'pen' ? (isDark ? '#fff' : '#111') : (isDark ? '#aaa' : '#666'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                    title="Pincel Livre"
                                >
                                    <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>

                                <button
                                    onClick={() => setTool('select')}
                                    style={{
                                        width: isMobile ? '28px' : '32px',
                                        height: isMobile ? '28px' : '32px',
                                        borderRadius: '6px',
                                        background: tool === 'select' ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0') : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: tool === 'select' ? (isDark ? '#fff' : '#111') : (isDark ? '#aaa' : '#666'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                    title="Mover Sólidos"
                                >
                                    <Hand size={isMobile ? 12 : 14} />
                                </button>
                            </div>

                            {/* Actions */}
                            {!isMobile && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '0 4px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0', flexShrink: 0 }}>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        style={{ width: '40px', accentColor: color }}
                                        title="Tamanho do Pincel/Borracha"
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0px', flexShrink: 0 }}>
                                <button onClick={() => setUndoTrigger(prev => prev + 1)} style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Desfazer (Undo)"><Undo size={isMobile ? 12 : 14} /></button>
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: isDark ? '#ff4757' : '#ff4757', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Apagar Tudo"
                                >
                                    <Eraser size={isMobile ? 12 : 14} />
                                </button>



                                <input type="file" id="bg-upload" hidden accept="image/*" onChange={handleBackgroundUpload} />
                                <button onClick={() => document.getElementById('bg-upload')?.click()} style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Background Image"><Layers size={isMobile ? 12 : 14} /></button>

                                <button onClick={() => setIsDark(!isDark)} style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Toggle Theme">{isDark ? <Sun size={isMobile ? 12 : 14} /> : <Moon size={isMobile ? 12 : 14} />}</button>

                                <button onClick={saveBoard} style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Guardar Quadro"><Save size={isMobile ? 12 : 14} /></button>

                                {/* Collaborative Drawing Panel */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowParticipantsPanel(!showParticipantsPanel)}
                                        style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: showParticipantsPanel ? primaryColor : 'transparent', color: showParticipantsPanel ? '#fff' : (isDark ? '#fff' : '#666'), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        title="Permissões de Desenho"
                                    >
                                        <PenLine size={isMobile ? 12 : 14} />
                                        {isMentor && raisedHands.size > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '18px',
                                                    height: '18px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 10px rgba(239,68,68,0.4)',
                                                    border: `2px solid ${isDark ? '#1a1a1a' : '#fff'}`,
                                                    zIndex: 2
                                                }}
                                            >
                                                {raisedHands.size}
                                            </motion.div>
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {showParticipantsPanel && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '50px',
                                                    right: 0,
                                                    background: isDark ? '#1a1a1a' : '#fff',
                                                    border: isDark ? '1px solid #333' : '1px solid #eee',
                                                    borderRadius: '16px',
                                                    padding: '14px',
                                                    boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
                                                    zIndex: 200,
                                                    minWidth: '240px',
                                                    maxHeight: '320px',
                                                    overflowY: 'auto'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#888', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={12} /> Giz (Permissões)</div>
                                                    {participants.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button
                                                                onClick={grantAllDrawingPermissions}
                                                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
                                                            >
                                                                Tudo
                                                            </button>
                                                            <button
                                                                onClick={revokeAllDrawingPermissions}
                                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
                                                            >
                                                                Limpar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {participants.length === 0 ? (
                                                    <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '10px 0' }}>Nenhum participante conectado.</p>
                                                ) : (
                                                    participants.map((p: any) => (
                                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: isDark ? '1px solid #333' : '1px solid #f5f5f5' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                                                <div style={{
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '50%',
                                                                    overflow: 'hidden',
                                                                    background: '#f0f0f0',
                                                                    flexShrink: 0,
                                                                    border: raisedHands.has(p.socketId) ? `2px solid ${primaryColor}` : '2px solid transparent',
                                                                    boxShadow: raisedHands.has(p.socketId) ? `0 0 10px ${primaryColor}4D` : 'none',
                                                                    transition: 'all 0.3s'
                                                                }}>
                                                                    <Image src={p.photo || '/default-avatar.png'} width={28} height={28} alt={p.name} style={{ objectFit: 'cover' }} />
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 700,
                                                                        color: raisedHands.has(p.socketId) ? primaryColor : (isDark ? '#fff' : '#111'),
                                                                        maxWidth: '110px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        transition: 'all 0.3s'
                                                                    }}>
                                                                        {p.name}
                                                                    </span>
                                                                    {raisedHands.has(p.socketId) && (
                                                                        <div style={{ position: 'relative' }}>
                                                                            <motion.div
                                                                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900 }}
                                                                            >
                                                                                ✋ {t('hub.salaDeEventos.raiseHand')}
                                                                                {isMentor && (
                                                                                    <button
                                                                                        onClick={() => mentorLowerHand(p.socketId)}
                                                                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                                        title={t('hub.salaDeEventos.lowerHand')}
                                                                                    >
                                                                                        <X size={10} />
                                                                                    </button>
                                                                                )}
                                                                            </motion.div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => toggleDrawingPermission(p.socketId)}
                                                                    style={{
                                                                        background: drawingPermissions.has(p.socketId) ? '#fee2e2' : 'rgba(14,165,233,0.1)',
                                                                        color: drawingPermissions.has(p.socketId) ? '#ef4444' : '#0ea5e9',
                                                                        border: 'none',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '8px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 800,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    <PenLine size={12} />
                                                                    {drawingPermissions.has(p.socketId) ? t('hub.salaDeEventos.revokeDrawing') : t('hub.salaDeEventos.giveDrawing')}
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleMicPermission(p.socketId)}
                                                                    style={{
                                                                        background: micPermissions.has(p.socketId) ? '#fee2e2' : 'rgba(34,197,94,0.1)',
                                                                        color: micPermissions.has(p.socketId) ? '#ef4444' : '#22c55e',
                                                                        border: 'none',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '8px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 800,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap',
                                                                        minWidth: '85px',
                                                                    }}
                                                                >
                                                                    {micPermissions.has(p.socketId) ? <MicOff size={12} /> : <Mic size={12} />}
                                                                    {micPermissions.has(p.socketId) ? t('hub.salaDeEventos.closeMic') : t('hub.salaDeEventos.openMic')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', margin: '0 2px' }} />

                                {/* Page Navigation */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px', borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0', flexShrink: 0 }}>
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
                                        padding: '0 8px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.65rem',
                                        flexShrink: 0
                                    }}
                                >
                                    {isAudioActive ? <MicOff size={14} /> : <Mic size={14} />}
                                    {!isMobile && (isAudioActive ? t('hub.salaDeEventos.mute') : t('hub.salaDeEventos.speak'))}
                                </button>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowAudioTest(!showAudioTest)}
                                        style={{
                                            background: showAudioTest ? (isDark ? 'rgba(255,255,255,0.1)' : '#eee') : 'none',
                                            color: isDark ? '#fff' : '#666',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Testar Som e Microfone"
                                    >
                                        <Settings size={14} />
                                    </button>

                                    <AnimatePresence>
                                        {showAudioTest && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '40px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: isDark ? '#1e293b' : '#fff',
                                                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    width: '180px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '10px'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#cbd5e1' : '#64748b' }}>Teste de Áudio</div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.65rem' }}>Microfone:</span>
                                                        <Activity size={12} color={testMicLevel > 10 ? '#22c55e' : '#94a3b8'} />
                                                    </div>
                                                    <div style={{ height: '6px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <motion.div
                                                            animate={{ width: `${testMicLevel}%` }}
                                                            style={{ height: '100%', background: '#22c55e' }}
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleTestSpeakers}
                                                    style={{
                                                        background: isTestingSpeakers ? '#f0fdf4' : (isDark ? '#334155' : '#f8fafc'),
                                                        color: isTestingSpeakers ? '#22c55e' : (isDark ? '#fff' : '#1e293b'),
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Volume2 size={12} /> Testar Saída (Som)
                                                </button>

                                                <button
                                                    onClick={() => setShowAudioTest(false)}
                                                    style={{
                                                        background: '#ef4444',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Fechar
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {isMentor && (
                                    <button
                                        onClick={() => {
                                            if (isMutingAll) return;
                                            setIsMutingAll(true);
                                            socket?.emit('live_board:mute_all', formId);
                                            toast.success('🔇 Todos os microfones foram mutados.');
                                            setTimeout(() => setIsMutingAll(false), 2000);
                                        }}
                                        disabled={isMutingAll}
                                        style={{
                                            background: isMutingAll ? '#f0f0f0' : (isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2'),
                                            color: '#ef4444',
                                            border: 'none',
                                            padding: '0 6px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            fontWeight: 800,
                                            cursor: isMutingAll ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            fontSize: '0.65rem',
                                            flexShrink: 0,
                                            transition: 'all 0.2s',
                                            opacity: isMutingAll ? 0.7 : 1
                                        }}
                                        title="Mutar todos os participantes"
                                    >
                                        {isMutingAll ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><VolumeX size={14} /></motion.div> : <VolumeX size={14} />}
                                        {!isMobile && (isMutingAll ? 'A Mutar...' : 'Mutar Todos')}
                                    </button>
                                )}

                                {isMentor && (
                                    <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                                        <button
                                            onClick={() => setShowAnnouncementMenu(!showAnnouncementMenu)}
                                            style={{
                                                background: showAnnouncementMenu ? primaryColor : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8'),
                                                color: showAnnouncementMenu ? '#fff' : (isDark ? '#fff' : '#666'),
                                                border: 'none',
                                                padding: '0 6px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px',
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                flexShrink: 0
                                            }}
                                            title="Enviar avisos e alertas para os alunos"
                                        >
                                            <Megaphone size={14} /> {!isMobile && "Avisos"}
                                        </button>



                                        <button
                                            onClick={() => setShowQuizCreator(true)}
                                            style={{
                                                background: currentQuiz ? '#f0fdf4' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8'),
                                                color: currentQuiz ? '#22c55e' : (isDark ? '#fff' : '#666'),
                                                border: 'none',
                                                width: isMobile ? '26px' : '30px',
                                                height: isMobile ? '26px' : '30px',
                                                borderRadius: '8px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                            title="Criar Quiz"
                                        >
                                            <HelpCircle size={isMobile ? 12 : 14} />
                                        </button>

                                        <div style={{ width: '1px', height: '20px', background: isDark ? 'rgba(255,255,255,0.1)' : '#eee', margin: '0 4px' }} />

                                        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                                            <button
                                                onClick={() => sendReaction('Sim')}
                                                style={{
                                                    background: '#22c55e',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0 6px',
                                                    height: '30px',
                                                    borderRadius: '8px',
                                                    fontWeight: 900,
                                                    fontSize: '0.6rem',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 10px rgba(34,197,94,0.3)',
                                                    flexShrink: 0
                                                }}
                                            >
                                                SIM
                                            </button>
                                            <button
                                                onClick={() => sendReaction('Não')}
                                                style={{
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0 6px',
                                                    height: '30px',
                                                    borderRadius: '8px',
                                                    fontWeight: 900,
                                                    fontSize: '0.6rem',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 10px rgba(239,68,68,0.3)',
                                                    flexShrink: 0
                                                }}
                                            >
                                                NÃO
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f0f0f0', margin: '0 10px', flexShrink: 0 }} />

                                <button
                                    onClick={() => {
                                        setIsSidebarOpen(true);
                                        setUnreadCount(0);
                                    }}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#111',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0 10px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.65rem',
                                        flexShrink: 0,
                                        position: 'relative',
                                        marginRight: '5px'
                                    }}
                                >
                                    <MessageSquare size={12} /> {!isMobile && "Chat"}
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 2px 10px rgba(239,68,68,0.4)'
                                                }}
                                            >
                                                {unreadCount}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Participant View */}
                            <div style={{ display: 'flex', gap: '8px', padding: '4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                                {/* Mic & Settings Group */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <button
                                        onClick={() => {
                                            if (isAudioActive) {
                                                handleStopAudio();
                                            } else {
                                                handleStartAudio();
                                            }
                                        }}
                                        style={{
                                            background: isAudioActive ? '#fee2e2' : primaryColor,
                                            color: isAudioActive ? '#ef4444' : '#fff',
                                            border: 'none',
                                            padding: isMobile ? '0 8px' : '0 12px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            fontSize: '0.65rem',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: `0 4px 12px ${primaryColor}33`,
                                            flexShrink: 0
                                        }}
                                    >
                                        {isAudioActive ? <MicOff size={14} /> : <Mic size={14} />}
                                        {isAudioActive ? t('hub.salaDeEventos.mute') : t('hub.salaDeEventos.speak')}
                                    </button>

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowAudioTest(!showAudioTest)}
                                            style={{
                                                background: showAudioTest ? (isDark ? 'rgba(255,255,255,0.1)' : '#eee') : 'none',
                                                color: isDark ? '#fff' : '#666',
                                                border: 'none',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                flexShrink: 0
                                            }}
                                            title="Testar Som e Microfone"
                                        >
                                            <Settings size={14} />
                                        </button>

                                        <AnimatePresence>
                                            {showAudioTest && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '40px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: isDark ? '#1e293b' : '#fff',
                                                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        width: '180px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                                        zIndex: 1000,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#cbd5e1' : '#64748b' }}>Teste de Áudio</div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.65rem' }}>Microfone:</span>
                                                            <Activity size={12} color={testMicLevel > 10 ? '#22c55e' : '#94a3b8'} />
                                                        </div>
                                                        <div style={{ height: '6px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <motion.div
                                                                animate={{ width: `${testMicLevel}%` }}
                                                                style={{ height: '100%', background: '#22c55e' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleTestSpeakers}
                                                        style={{
                                                            background: isTestingSpeakers ? '#f0fdf4' : (isDark ? '#334155' : '#f8fafc'),
                                                            color: isTestingSpeakers ? '#22c55e' : (isDark ? '#fff' : '#1e293b'),
                                                            border: 'none',
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Volume2 size={12} /> Testar Saída (Som)
                                                    </button>

                                                    <button
                                                        onClick={() => setShowAudioTest(false)}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Fechar
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#eee', margin: '0 2px', flexShrink: 0 }} />

                                {/* Reactions Row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                                    {['❤️', '👏', '🔥', '😮', '😂', '💯'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => sendReaction(emoji)}
                                            style={{
                                                fontSize: isMobile ? '1rem' : '1.2rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                transition: 'transform 0.1s',
                                                flexShrink: 0
                                            }}
                                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ width: '1px', height: '20px', background: isDark ? 'rgba(255,255,255,0.1)' : '#eee', margin: '0 2px', flexShrink: 0 }} />

                                {/* Quick Answer Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                        onClick={() => sendReaction('Sim')}
                                        style={{
                                            background: '#22c55e',
                                            color: '#fff',
                                            border: 'none',
                                            padding: isMobile ? '0 6px' : '0 10px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            fontWeight: 900,
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(34,197,94,0.3)',
                                            transition: 'transform 0.1s',
                                            flexShrink: 0
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        SIM
                                    </button>
                                    <button
                                        onClick={() => sendReaction('Não')}
                                        style={{
                                            background: '#ef4444',
                                            color: '#fff',
                                            border: 'none',
                                            padding: isMobile ? '0 6px' : '0 10px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            fontWeight: 900,
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(239,68,68,0.3)',
                                            transition: 'transform 0.1s',
                                            flexShrink: 0
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        NÃO
                                    </button>
                                    <button
                                        onClick={() => sendReaction('Entendi!')}
                                        style={{
                                            background: primaryColor,
                                            color: '#fff',
                                            border: 'none',
                                            padding: isMobile ? '0 6px' : '0 10px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            fontWeight: 900,
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            boxShadow: `0 4px 10px ${primaryColor}4D`,
                                            transition: 'transform 0.1s',
                                            flexShrink: 0
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        ENTENDI
                                    </button>
                                </div>

                                <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : '#eee', margin: '0 4px', flexShrink: 0 }} />

                                <button
                                    onClick={handleRaiseHand}
                                    style={{
                                        background: isHandRaised ? '#fef3c7' : '#f0f9ff',
                                        color: isHandRaised ? '#d97706' : '#0ea5e9',
                                        border: isHandRaised ? '1.5px solid #fbbf24' : 'none',
                                        padding: isMobile ? '0 8px' : '0 12px',
                                        height: isMobile ? '32px' : '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '0.7rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Hand size={18} />
                                    {!isMobile && (isHandRaised ? 'Abaixar Mão' : 'Dúvida')}
                                </button>
                                {/* Export Button for participants */}
                                <button
                                    onClick={handleExportBoard}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                        color: '#22c55e',
                                        border: 'none',
                                        padding: isMobile ? '0 8px' : '0 12px',
                                        height: isMobile ? '32px' : '36px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.65rem'
                                    }}
                                    title="Tirar Screenshot do quadro"
                                >
                                    <Download size={14} /> {!isMobile && "Screenshot"}
                                </button>

                                {/* Drawing permission indicator for participant */}
                                {drawingPermissions.has((window as any).__liveBoardSocketId || '') && (
                                    <div style={{
                                        background: 'rgba(14,165,233,0.1)',
                                        color: '#0ea5e9',
                                        border: '1px solid rgba(14,165,233,0.3)',
                                        padding: '0 10px',
                                        height: isMobile ? '28px' : '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <PenLine size={12} /> A Desenhar
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setIsSidebarOpen(true);
                                        setUnreadCount(0);
                                    }}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#111',
                                        color: '#fff',
                                        border: 'none',
                                        padding: isMobile ? '0 8px' : '0 12px',
                                        height: isMobile ? '32px' : '32px',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '0.7rem',
                                        position: 'relative',
                                        flexShrink: 0
                                    }}
                                >
                                    <MessageSquare size={14} /> {!isMobile && "Perguntas"}
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 2px 10px rgba(239,68,68,0.4)'
                                                }}
                                            >
                                                {unreadCount}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ===== Raised Hands Floating Panel (Mentor Only) ===== */}
            <AnimatePresence>
                {isMentor && !isMinimized && raisedHands.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{
                            position: 'absolute',
                            top: '80px',
                            left: '20px',
                            zIndex: 5000,
                            background: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.97)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                            padding: '12px 14px',
                            minWidth: '220px',
                            maxWidth: '280px',
                        }}
                    >
                        {/* Panel Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                style={{ fontSize: '1.2rem' }}
                            >
                                ✋
                            </motion.span>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: isDark ? '#fff' : '#111' }}>
                                    Mãos Levantadas
                                </div>
                                <div style={{ fontSize: '0.65rem', color: isDark ? '#aaa' : '#888', fontWeight: 600 }}>
                                    {raisedHands.size} participante{raisedHands.size !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Participant list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {participants.filter(p => raisedHands.has(p.socketId)).map(p => (
                                <motion.div
                                    key={p.socketId}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                                        borderRadius: '10px',
                                        padding: '7px 10px',
                                        border: `1.5px solid ${primaryColor}33`
                                    }}
                                >
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        overflow: 'hidden', flexShrink: 0,
                                        border: `2px solid ${primaryColor}`
                                    }}>
                                        <Image
                                            src={p.photo || '/default-avatar.png'}
                                            width={28} height={28} alt={p.name}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span style={{
                                        flex: 1,
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        color: isDark ? '#fff' : '#111',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {p.name}
                                    </span>
                                    <button
                                        title="Dispensar"
                                        onClick={() => {
                                            // Mentor acknowledges / manually lowers hand
                                            socket?.emit('live_board:lower_hand', { formId, socketId: p.socketId });
                                            setRaisedHands(prev => {
                                                const next = new Set(prev);
                                                next.delete(p.socketId);
                                                return next;
                                            });
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: isDark ? '#aaa' : '#999',
                                            padding: '0',
                                            display: 'flex',
                                            flexShrink: 0
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Perguntas & Chat */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute',
                            top: isMobile ? 0 : '100px',
                            right: isMobile ? 0 : '20px',
                            width: isMobile ? '100%' : '260px',
                            height: isMobile ? '100%' : 'calc(100% - 240px)',
                            background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: isMobile ? 'none' : '-20px 0 50px rgba(0,0,0,0.15)',
                            zIndex: 10000,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: isMobile ? 0 : '24px',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '10px 16px',
                            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: primaryColor + '22', color: primaryColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MessageSquare size={18} />
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '1rem', color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}>
                                    {t('hub.salaDeEventos.chatTitle') || "Perguntas e Chat"}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                                    border: 'none', width: '36px', height: '36px',
                                    borderRadius: '12px', cursor: 'pointer', color: isDark ? '#aaa' : '#666',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#eee')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            overflowY: 'auto',
                            scrollBehavior: 'smooth'
                        }}>
                            {messages.length === 0 ? (
                                <div style={{
                                    flex: 1, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: isDark ? '#64748b' : '#94a3b8',
                                    textAlign: 'center', padding: '40px'
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '30px',
                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '20px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f0f0f0'
                                    }}>
                                        <MessageSquare size={32} opacity={0.3} />
                                    </div>
                                    <p style={{ fontWeight: 800, fontSize: '1rem', margin: '0 0 8px 0', color: isDark ? '#cbd5e1' : '#475569' }}>
                                        {t('hub.salaDeEventos.noMessages') || "Sem mensagens ainda"}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '200px', lineHeight: 1.5 }}>
                                        {t('hub.salaDeEventos.startConversation') || "Participe da aula enviando a sua primeira pergunta!"}
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMe = msg.userData?.id === userId;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: isMe ? 'row-reverse' : 'row',
                                                gap: '12px',
                                                alignItems: 'flex-end',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            {!isMe && (
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '12px',
                                                    overflow: 'hidden', flexShrink: 0,
                                                    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                                    background: '#f1f5f9'
                                                }}>
                                                    <Image
                                                        src={msg.userData?.photo || msg.userData?.profilePhoto || '/default-avatar.png'}
                                                        width={32} height={32} alt=""
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '75%'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    marginBottom: '3px',
                                                    marginLeft: isMe ? '0' : '4px',
                                                    marginRight: isMe ? '4px' : '0'
                                                }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 900,
                                                        color: isMe ? primaryColor : (msg.userData?.role === 'mentor' || msg.userData?.role === 'SuperAdmin' ? primaryColor : (isDark ? '#cbd5e1' : '#475569')),
                                                    }}>
                                                        {isMe ? (t('hub.salaDeEventos.me') || 'Eu') : (msg.userData?.name || 'Usuário')}
                                                    </span>
                                                    {(msg.userData?.role === 'mentor' || msg.userData?.role === 'SuperAdmin') && (
                                                        <span style={{
                                                            fontSize: '0.6rem',
                                                            fontWeight: 900,
                                                            background: primaryColor,
                                                            color: '#fff',
                                                            padding: '0px 5px',
                                                            borderRadius: '4px',
                                                            textTransform: 'uppercase',
                                                            height: '14px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            Mentor
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: isMe ? '#fff' : (isDark ? '#e2e8f0' : '#1e293b'),
                                                    lineHeight: '1.4',
                                                    background: isMe ? primaryColor : (isDark ? '#334155' : '#f1f5f9'),
                                                    padding: '8px 12px',
                                                    borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                                    boxShadow: isMe ? `0 4px 12px ${primaryColor}33` : 'none',
                                                    fontWeight: 600
                                                }}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '10px 16px',
                            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={t('hub.salaDeEventos.chatPlaceholder') || "Escreva uma mensagem..."}
                                    style={{
                                        width: '100%',
                                        padding: '14px 50px 14px 16px',
                                        borderRadius: '16px',
                                        border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                                        background: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#1e293b',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                                    onBlur={(e) => (e.target.style.borderColor = isDark ? '#475569' : '#e2e8f0')}
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: chatInput.trim() ? primaryColor : 'transparent',
                                        color: chatInput.trim() ? '#fff' : (isDark ? '#475569' : '#94a3b8'),
                                        border: 'none',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: chatInput.trim() ? 'pointer' : 'default',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <div style={{
                                textAlign: 'center', marginTop: '12px',
                                fontSize: '0.65rem', fontWeight: 800,
                                color: isDark ? '#64748b' : '#94a3b8',
                                letterSpacing: '0.02em'
                            }}>
                                {t('hub.salaDeEventos.chatTip') || "APERTE ENTER PARA ENVIAR"}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Quiz Overlays */}
            <AnimatePresence>
                {showQuizCreator && (
                    <QuizCreator
                        isDark={isDark}
                        isMobile={isMobile}
                        onClose={() => setShowQuizCreator(false)}
                        onSubmit={(quiz: any) => {
                            socket?.emit('live_board:quiz_start', { formId, quiz });
                            setShowQuizCreator(false);
                        }}
                    />
                )}

                {currentQuiz && (
                    <QuizOverlay
                        quiz={currentQuiz}
                        results={quizResults}
                        detailedResults={quizDetailedResults}
                        hasVoted={hasVoted}
                        selectedOption={selectedOption}
                        isMentor={isMentor}
                        isDark={isDark}
                        isMobile={isMobile}
                        onVote={(idx: number) => {
                            if (!hasVoted) {
                                setSelectedOption(idx);
                                setHasVoted(true);
                                const user = authService.getCurrentUser();
                                socket?.emit('live_board:quiz_vote', {
                                    formId,
                                    optionIndex: idx,
                                    userData: { name: user?.name, photo: (user as any)?.photo || (user as any)?.profilePhoto }
                                });
                                toast.success(t('hub.salaDeEventos.quizVotedToast') || "Voto registado!");
                            }
                        }}
                        onReveal={() => socket?.emit('live_board:quiz_reveal', formId)}
                        onEnd={() => socket?.emit('live_board:quiz_end', formId)}
                        isRevealed={isQuizRevealed}
                        correctOption={correctQuizOption !== null ? correctQuizOption : currentQuiz.correctOption}
                    />
                )}
            </AnimatePresence>

            {/* Question Sidebar Logic Overlay UI should be above Canvas but below specialized modals */}

            {/* Announcement / Status Overlay (Non-intrusive card at bottom-center) */}
            <AnimatePresence>
                {currentAnnouncement && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            style={{
                                background: isDark ? '#1a1a1a' : '#fff',
                                padding: isMobile ? '30px 20px' : '40px 60px',
                                borderRadius: '32px',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                                border: isDark ? '1px solid #333' : '1px solid #eee',
                                maxWidth: '90%',
                                width: 'fit-content',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '24px',
                                textAlign: 'center'
                            }}
                        >
                            <div>
                                <h2 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: isMobile ? '1.5rem' : '2.25rem',
                                    fontWeight: 900,
                                    color: (announcementsList.find(a => a.id === currentAnnouncement.type) as any)?.color || primaryColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
                                        {announcementsList.find(a => a.id === currentAnnouncement.type)?.icon || '📢'}
                                    </span>
                                    {announcementsList.find(a => a.id === currentAnnouncement.type)?.label || 'Aviso importante'}
                                </h2>
                                <p style={{
                                    margin: 0,
                                    fontSize: isMobile ? '1rem' : '1.25rem',
                                    fontWeight: 600,
                                    color: isDark ? '#ddd' : '#444',
                                    lineHeight: '1.6'
                                }}>
                                    {currentAnnouncement.message}
                                </p>
                            </div>

                            {isMentor && (
                                <button
                                    onClick={() => socket?.emit('live_board:announcement:clear', formId)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '12px 30px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: '#f0f0f0',
                                        color: '#666',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Fechar Aviso
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showNotifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 10001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: isDark ? '#1a1a1a' : '#fff',
                                width: '100%',
                                maxWidth: '550px',
                                borderRadius: '32px',
                                padding: '35px',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                border: isDark ? '1px solid #333' : '1px solid #eee'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#fff' : '#111' }}>Notificar Participantes</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Personalize o convite antes de enviar</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowNotifyModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        <Edit2 size={12} /> Assunto do E-mail
                                    </label>
                                    <input
                                        type="text"
                                        value={customSubject}
                                        onChange={(e) => setCustomSubject(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            borderRadius: '16px',
                                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
                                            border: isDark ? '1px solid #333' : '1px solid #eee',
                                            color: isDark ? '#fff' : '#111',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        <Edit2 size={12} /> Corpo da Mensagem
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        rows={6}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            borderRadius: '16px',
                                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
                                            border: isDark ? '1px solid #333' : '1px solid #eee',
                                            color: isDark ? '#fff' : '#111',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            outline: 'none',
                                            resize: 'none',
                                            lineHeight: 1.5
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={confirmNotifyMissing}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '18px',
                                        background: '#22c55e',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        marginTop: '10px',
                                        boxShadow: '0 10px 20px rgba(34,197,94,0.3)'
                                    }}
                                >
                                    <Send size={18} /> Enviar Convites Agora
                                </button>

                                <p style={{ margin: 0, textAlign: 'center', fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>
                                    * Os e-mails serão enviados apenas para inscritos que ainda não entraram na sessão.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div >
                )}
            </AnimatePresence >

            {/* MODALS MOVED TO ROOT TO PREVENT POSITION:FIXED ISSUES */}
            <AnimatePresence>
                {showClearConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 20000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            style={{
                                background: isDark ? '#1a1a1a' : '#fff',
                                padding: isMobile ? '30px 20px' : '40px',
                                borderRadius: '32px',
                                maxWidth: '420px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                border: isDark ? '1px solid #333' : '1px solid #eee'
                            }}
                        >
                            <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Eraser size={36} />
                            </div>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 900, color: isDark ? '#fff' : '#111' }}>Limpar Quadro?</h3>
                            <p style={{ margin: '0 0 32px 0', color: isDark ? '#aaa' : '#666', fontWeight: 600, fontSize: '1rem', lineHeight: '1.6' }}>
                                Esta ação apagará permanentemente todos os desenhos de todas as páginas. Tem a certeza que deseja prosseguir?
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', background: isDark ? '#333' : '#f5f5f5', color: isDark ? '#fff' : '#666', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        socket?.emit('live_board:action', { formId, action: 'clear' });
                                        setShowClearConfirm(false);
                                        toast.success('🪄 Quadro limpo com sucesso!');
                                    }}
                                    style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(239,68,68,0.2)' }}
                                >
                                    Sim, Limpar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAnnouncementMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'fixed',
                            bottom: '90px',
                            right: '50%',
                            transform: 'translateX(50%)',
                            background: isDark ? '#1a1a1a' : '#fff',
                            padding: '12px',
                            borderRadius: '16px',
                            boxShadow: '0 -10px 25px rgba(0,0,0,0.3)',
                            border: isDark ? '1px solid #444' : '1px solid #e0e0e0',
                            zIndex: 9999,
                            width: '240px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}
                    >
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#888', marginBottom: '4px' }}>ANÚNCIOS RÁPIDOS</span>
                        {announcementsList.map(ann => (
                            <button
                                key={ann.id}
                                onClick={() => {
                                    handleAnnouncement(ann);
                                    setShowAnnouncementMenu(false);
                                }}
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', background: isDark ? '#333' : '#f5f5f5', color: isDark ? '#fff' : '#444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span style={{ fontSize: '1rem' }}>{ann.icon}</span> {ann.label}
                            </button>
                        ))}

                        <div style={{ padding: '4px 0', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '4px' }}>
                            <input
                                type="text"
                                value={customAnnouncementText}
                                onChange={(e) => setCustomAnnouncementText(e.target.value)}
                                placeholder="Aviso personalizado..."
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: isDark ? '1px solid #333' : '1px solid #eee', background: isDark ? '#111' : '#f8f8f8', color: isDark ? '#fff' : '#111', fontSize: '0.75rem', fontWeight: 600, outline: 'none' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customAnnouncementText.trim()) {
                                        handleAnnouncement({ id: 'custom', message: customAnnouncementText, type: 'custom', icon: '📢', color: primaryColor });
                                        setCustomAnnouncementText("");
                                        setShowAnnouncementMenu(false);
                                    }
                                }}
                            />
                        </div>

                        {currentAnnouncement && (
                            <button
                                onClick={clearAnnouncement}
                                style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Limpar Anúncio
                            </button>
                        )}
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
        </motion.div >
    );
}

// Componente para Criar Quiz
const QuizCreator = ({ isDark, isMobile, onClose, onSubmit }: any) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctOption, setCorrectOption] = useState(0);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                style={{ background: isDark ? '#1a1a1a' : '#fff', width: '100%', maxWidth: isMobile ? '90%' : '450px', borderRadius: '24px', padding: isMobile ? '20px' : '32px', border: isDark ? '1px solid #333' : '1px solid #eee' }}
            >
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#fff' : '#111' }}>Lançar Novo Quiz</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: '#888' }}>PERGUNTA</label>
                        <input
                            autoFocus value={question} onChange={e => setQuestion(e.target.value)}
                            placeholder="Ex: Qual o resultado de 2 + 2?"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: isDark ? '1px solid #333' : '1px solid #eee', background: isDark ? '#111' : '#f8f8f8', color: isDark ? '#fff' : '#111', fontWeight: 600, outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: '#888' }}>OPÇÕES</label>
                        {options.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                <input
                                    type="radio" name="correct" checked={correctOption === idx} onChange={() => setCorrectOption(idx)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    value={opt} onChange={e => {
                                        const newOpts = [...options];
                                        newOpts[idx] = e.target.value;
                                        setOptions(newOpts);
                                    }}
                                    placeholder={`Opção ${idx + 1}`}
                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: isDark ? '1px solid #333' : '1px solid #eee', background: isDark ? '#111' : '#f8f8f8', color: isDark ? '#fff' : '#111', fontWeight: 600, outline: 'none' }}
                                />
                                {options.length > 2 && (
                                    <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                                )}
                            </div>
                        ))}
                        {options.length < 4 && (
                            <button onClick={() => setOptions([...options, ''])} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', padding: '4px' }}>+ Adicionar Opção</button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', background: isDark ? '#333' : '#f0f0f0', color: isDark ? '#fff' : '#666', fontWeight: 800, cursor: 'pointer' }}>Cancelar</button>
                    <button
                        onClick={() => onSubmit({ question, options, correctOption })}
                        disabled={!question || options.some(o => !o)}
                        style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: (!question || options.some(o => !o)) ? 0.5 : 1 }}
                    >
                        Lançar Quiz
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Componente para Visualizar Quiz (Participante e Mentor)
const QuizOverlay = ({ quiz, results, detailedResults, hasVoted, selectedOption, isMentor, isDark, isMobile, onVote, onReveal, onEnd, isRevealed, correctOption }: any) => {
    const totalVotes = results.reduce((a: number, b: number) => a + b, 0);
    const { t } = useTranslate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{
                position: 'absolute',
                top: isMobile ? '70px' : '80px',
                right: isMobile ? '50%' : '20px',
                transform: isMobile ? 'translateX(50%)' : 'none',
                width: isMobile ? '90%' : '300px',
                background: isDark ? '#1a1a1a' : '#fff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: isDark ? '1px solid #333' : '1px solid #eee',
                zIndex: 500
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0ea5e9', background: 'rgba(14,165,233,0.1)', padding: '4px 8px', borderRadius: '6px' }}>QUIZ EM DIRETO</span>
                {isMentor && <button onClick={onEnd} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={16} /></button>}
            </div>

            <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 900, color: isDark ? '#fff' : '#111', lineHeight: 1.4 }}>{quiz.question}</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quiz.options.map((option: string, idx: number) => {
                    const percent = totalVotes > 0 ? Math.round((results[idx] / totalVotes) * 100) : 0;
                    const isCorrect = isRevealed && idx === correctOption;
                    const isSelected = hasVoted && idx === selectedOption;

                    return (
                        <button
                            key={idx}
                            disabled={hasVoted && !isMentor}
                            onClick={() => onVote(idx)}
                            style={{
                                position: 'relative',
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: isCorrect ? '2px solid #22c55e' : (isSelected ? '2px solid #0ea5e9' : (isDark ? '1px solid #333' : '1px solid #eee')),
                                background: isCorrect ? (isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4') : (isSelected ? (isDark ? 'rgba(14,165,233,0.1)' : '#f0f9ff') : (isDark ? '#111' : '#fff')),
                                textAlign: 'left',
                                cursor: (hasVoted || isMentor) ? 'default' : 'pointer',
                                overflow: 'hidden',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: isCorrect ? (isDark ? '#4ade80' : '#166534') : (isSelected ? '#0ea5e9' : (isDark ? '#fff' : '#444')), fontSize: '0.85rem' }}>{option}</span>
                                {(hasVoted || isMentor) && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCorrect ? (isDark ? '#4ade80' : '#166534') : '#888' }}>{percent}%</span>}
                            </div>

                            {(hasVoted || isMentor) && (
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                                    style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: isCorrect ? (isDark ? 'rgba(34,197,94,0.2)' : '#dcfce7') : (isSelected ? (isDark ? 'rgba(14,165,233,0.2)' : '#e0f2fe') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f8')), zIndex: 0 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}</span>
                    {isMentor && !isRevealed && (
                        <button
                            onClick={onReveal}
                            style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                            Revelar Resposta
                        </button>
                    )}
                </div>

                {isMentor && detailedResults && detailedResults.length > 0 && (
                    <div style={{ borderTop: isDark ? '1px solid #333' : '1px solid #eee', paddingTop: '15px' }}>
                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', fontWeight: 900, color: '#888', textTransform: 'uppercase' }}>
                            {t('hub.salaDeEventos.responses') || 'Respostas Detalhadas'}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                            {detailedResults.map((res: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', position: 'relative' }}>
                                            <Image src={res.photo || '/default-avatar.png'} width={20} height={20} alt="" style={{ objectFit: 'cover' }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#ccc' : '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                            {res.name}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        color: res.optionIndex === quiz.correctOption ? '#22c55e' : '#ef4444',
                                        background: res.optionIndex === quiz.correctOption ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {quiz.options[res.optionIndex]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
