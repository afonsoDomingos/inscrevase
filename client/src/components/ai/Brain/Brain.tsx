"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command, Power, Square } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';
import { aiService } from '@/lib/aiService';
import { useSocket } from '@/context/SocketContext';

export default function Brain() {
    const router = useRouter();
    const pathname = usePathname();
    const { socket } = useSocket();
    
    const [isVisible, setIsVisible] = useState(false);
    const [isHibernated, setIsHibernated] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-PT';
        utterance.rate = 1.0;
        utterance.pitch = 0.8;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Premium') || v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleCommand = useCallback(async (transcript: string) => {
        setLastCommand(transcript);
        setIsThinking(true);
        setIsAlert(false);

        const lowerTranscript = transcript.toLowerCase();

        // Comando Especial: Interrupção de Fala
        if (lowerTranscript.includes('cala-te') || lowerTranscript.includes('calar') || lowerTranscript.includes('parar') || lowerTranscript.includes('silêncio') || lowerTranscript.includes('chega')) {
            window.speechSynthesis?.cancel();
            setIsSpeaking(false);
            setIsThinking(false);
            toast.info("A fala foi interrompida.");
            return;
        }

        // Adiciona histórico de usuário
        setChatHistory(prev => [...prev, { role: 'user', text: transcript }]);

        // Comando Especial: Hibernação
        if (lowerTranscript.includes('dormir') || lowerTranscript.includes('desativar brain') || lowerTranscript.includes('desligar cérbero')) {
            speak("Entendido, Mestre. Entrando em modo de hibernação profunda. Estarei aqui se precisar de mim novamente.");
            setTimeout(() => {
                setIsVisible(false);
                setIsHibernated(true);
                toast.info("BRAIN entrou em hibernação.");
            }, 2000);
            setIsThinking(false);
            return;
        }

        // Mapeamento Abrangente de Rotas (Atalhos Rápidos)
        const routes: Record<string, { path: string, response: string, keywords: string[] }> = {
            '/dashboard/mentor?tab=overview': { path: '/dashboard/mentor?tab=overview', response: 'Entendido, Mestre. Carregando sua visão geral.', keywords: ['visão geral', 'resumo', 'dashboard mentor', 'painel mentor'] },
            '/dashboard/mentor?tab=forms': { path: '/dashboard/mentor?tab=forms', response: 'Abrindo seus eventos e formulários.', keywords: ['meus eventos', 'meus formulários', 'ver eventos'] },
            '/dashboard/mentor?tab=submissions': { path: '/dashboard/mentor?tab=submissions', response: 'Consultando a lista de participantes.', keywords: ['ver inscrições', 'participantes', 'lista de inscritos'] },
            '/dashboard/admin?tab=overview': { path: '/dashboard/admin?tab=overview', response: 'Acessando o centro de comando administrativo.', keywords: ['painel admin', 'dashboard admin', 'estatísticas globais'] },
            '/dashboard/admin?tab=users': { path: '/dashboard/admin?tab=users', response: 'Carregando a base de utilizadores da plataforma.', keywords: ['gestão de usuários', 'ver utilizadores', 'lista de pessoas'] },
            '/dashboard/perfil': { path: '/dashboard/perfil', response: 'Abrindo seu perfil profissional.', keywords: ['meu perfil', 'perfil profissional'] },
            '/': { path: '/', response: 'Retornando à página inicial. Até breve, Mestre.', keywords: ['ir para home', 'sair da dashboard', 'página inicial', 'site'] }
        };

        let foundEntry = null;
        for (const entry of Object.values(routes)) {
            if (entry.keywords.some(keyword => lowerTranscript.includes(keyword))) {
                foundEntry = entry;
                break;
            }
        }

        try {
            if (foundEntry) {
                speak(foundEntry.response);
                router.push(foundEntry.path);
                toast.success(foundEntry.response);
            } else if (lowerTranscript.includes('evento') || lowerTranscript.includes('criar')) {
                speak("Iniciando interface de criação de evento. O que deseja criar?");
                toast.info("Abrindo interface de criação...");
                window.dispatchEvent(new Event('open-create-event-modal'));
            } else {
                // Construção do contexto visual (Página atual e texto principal)
                let pageContext = `Rota atual: ${pathname}\n`;
                const mainContainer = document.querySelector('main') || document.body;
                if (mainContainer) {
                    // Extrai até 1500 caracteres de texto legível da tela para dar contexto à IA
                    pageContext += `Conteúdo visível no ecrã: ${mainContainer.innerText.substring(0, 1500)}`;
                }

                // Inteligência Contextual via Gemini
                const result = await aiService.brainCommand(transcript, pageContext);
                const reply = result.reply;
                setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
                
                // Resumo para fala (primeira frase ou limite curto)
                const firstSentence = reply.split(/[.!?\n]/)[0];
                const spokenSummary = firstSentence.length > 5 ? firstSentence + "." : reply.substring(0, 100) + "...";
                
                if (reply.length > 150) {
                    speak(spokenSummary + " Pode ler a resposta completa no terminal.");
                } else {
                    speak(reply);
                }
                
                toast.info("BRAIN processou sua consulta.");
            }
        } catch (error) {
            console.error("Brain Error:", error);
            speak("Peço desculpas, Mestre. Houve uma falha nos meus circuitos neurais.");
        } finally {
            setIsThinking(false);
        }
    }, [router, speak, pathname]);

    const { isListening, currentTranscript, startListening, hasSupport } = useSpeechRecognition(handleCommand);

    const introSound = useRef<HTMLAudioElement | null>(null);
    const closeSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        introSound.current = new Audio('/braindsound/1intro.mp3');
        closeSound.current = new Audio('/braindsound/2Fecho.mp3');
        // Pre-carregar para latência zero
        introSound.current.load();
        closeSound.current.load();
    }, []);

    // Função utilitária para tocar sons de sistema com latência zero
    const playSystemSound = useCallback((type: 'intro' | 'close') => {
        const audio = type === 'intro' ? introSound.current : closeSound.current;
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.8;
            audio.play().catch(() => {});
        }
    }, []);



    const [audioLevel, setAudioLevel] = useState(0);

    // Analisador de Áudio em Tempo Real
    useEffect(() => {
        if (!isListening) {
            setAudioLevel(0);
            return;
        }

        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let microphone: MediaStreamAudioSourceNode | null = null;
        let animationFrame: number;

        const startAnalyzing = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                audioContext = new AudioContextClass();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                analyser.fftSize = 32;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                microphone.connect(analyser);

                const updateVolume = () => {
                    if (!analyser) return;
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    setAudioLevel(average);
                    animationFrame = requestAnimationFrame(updateVolume);
                };

                updateVolume();
            } catch (err) {
                console.error("Erro ao acessar microfone para visualizer:", err);
            }
        };

        startAnalyzing();

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (audioContext) audioContext.close();
            if (microphone) microphone.disconnect();
        };
    }, [isListening]);

    // Componente de Visualização de Voz (Barras Reais)
    const VoiceVisualizer = () => (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', height: '32px', width: '100%', padding: '0 16px' }}>
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        height: isListening 
                            ? Math.max(4, (audioLevel / 100) * 45 - Math.abs(i - 6) * 2)
                            : isSpeaking 
                                ? [8, Math.random() * 20 + 8, 8] 
                                : 4,
                        opacity: isSpeaking || (isListening && audioLevel > 5) ? 1 : 0.3
                    }}
                    transition={{ 
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                    }}
                    style={{ 
                        width: '4px', 
                        borderRadius: '9999px', 
                        background: isAlert ? '#ef4444' : '#eab308',
                        boxShadow: (isSpeaking || isListening) && audioLevel > 10 ? `0 0 15px ${isAlert ? '#ef4444' : '#eab308'}` : 'none' 
                    }}
                />
            ))}
        </div>
    );

    // Sistema de Ativação por Voz (Wake-Word)
    useEffect(() => {
        if (!hasSupport) return;

        interface SpeechRecognitionEvent {
            results: {
                [key: number]: {
                    [key: number]: {
                        transcript: string;
                    };
                };
                length: number;
            };
        }

        interface SpeechRecognitionInstance {
            continuous: boolean;
            interimResults: boolean;
            lang: string;
            onresult: (event: SpeechRecognitionEvent) => void;
            onend: () => void;
            start: () => void;
            stop: () => void;
        }

        // Definindo tipo para o Window com as extensões necessárias
        type WindowWithSpeech = Window & typeof globalThis & {
            SpeechRecognition?: new () => SpeechRecognitionInstance;
            webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
        };

        const win = window as unknown as WindowWithSpeech;
        const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
        
        if (!SpeechRecognition) return;

        const wakeRecognition = new SpeechRecognition();
        
        wakeRecognition.continuous = true;
        wakeRecognition.interimResults = false;
        wakeRecognition.lang = 'pt-PT';

        wakeRecognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            
            if (transcript.includes('brain') || transcript.includes('cérbero') || transcript.includes('cerbero')) {
                if (!isVisible) {
                    setIsVisible(true);
                    playSystemSound('intro');
                    speak("Sim, Mestre. Estou às suas ordens.");
                    setTimeout(() => {
                        startListening();
                    }, 1000);
                }
            }
        };

        wakeRecognition.onend = () => {
            if (!isListening) {
                try {
                    wakeRecognition.start();
                } catch {
                    // Já está rodando
                }
            }
        };

        wakeRecognition.start();

        return () => {
            wakeRecognition.stop();
        };
    }, [hasSupport, isVisible, isListening, startListening, speak, playSystemSound]);

    // Monitoramento Proativo via Sockets
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: { title: string, content: string, type: string }) => {
            // Se for algo urgente ou pessoal, o Brain intervém
            setIsAlert(true);
            setIsVisible(true);
            
            const message = `Mestre, desculpe a interrupção. ${data.title}. ${data.content}`;
            speak(message);
            setLastCommand(`ALERTA: ${data.title}`);

            setTimeout(() => {
                setIsAlert(false);
            }, 5000);
        };

        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, speak, playSystemSound]);

    useEffect(() => {
        console.log("%c🧠 [BRAIN] Interface Neural Ativa", "color: #FFD700; font-weight: bold; font-size: 14px;");
        console.log("-> Suporte de Voz:", hasSupport);
        console.log("-> Posicionamento: Top-Left (Floating)");
    }, [hasSupport]);

    if (isHibernated) return null;
    if (!pathname?.startsWith('/dashboard')) return null;

    return (
        <>
            {/* Monitor HUD — Centered */}
            <div style={{ 
                position: 'fixed', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 99999, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            drag
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 30 }}
                            style={{ position: 'relative', width: '820px', height: '440px', cursor: 'grab', filter: isAlert ? 'drop-shadow(0 0 40px rgba(239,68,68,0.4))' : 'drop-shadow(0 0 30px rgba(234,179,8,0.2))', pointerEvents: 'auto' }}
                            whileDrag={{ cursor: 'grabbing', scale: 1.01 }}
                        >
                            {/* SVG Monitor Frame (Previous logic remains identical) */}
                            <svg width="820" height="440" viewBox="0 0 820 440" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                                <defs>
                                    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#1a1a1a" />
                                        <stop offset="10%" stopColor="#2e2e2e" />
                                        <stop offset="50%" stopColor="#3a3a3a" />
                                        <stop offset="90%" stopColor="#2e2e2e" />
                                        <stop offset="100%" stopColor="#1a1a1a" />
                                    </linearGradient>
                                    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(0,0,0,0.99)" />
                                        <stop offset="15%" stopColor={isAlert ? "rgba(40,10,10,0.8)" : "rgba(10,15,30,0.8)"} />
                                        <stop offset="50%" stopColor={isAlert ? "rgba(20,5,5,0.35)" : "rgba(5,10,25,0.35)"} />
                                        <stop offset="85%" stopColor={isAlert ? "rgba(40,10,10,0.8)" : "rgba(10,15,30,0.8)"} />
                                        <stop offset="100%" stopColor="rgba(0,0,0,0.99)" />
                                    </linearGradient>
                                    <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor={isAlert ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.08)"} />
                                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                                    </radialGradient>
                                    <linearGradient id="glossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                                        <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>
                                </defs>

                                <ellipse cx="410" cy="425" rx="180" ry="15" fill="rgba(0,0,0,0.5)" />
                                <path d="M 0,0 Q 410,24 820,0 L 820,340 Q 410,316 0,340 Z" fill="none" stroke={isAlert ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.08)"} strokeWidth="4" filter="blur(4px)" />
                                <path d="M 0,0 Q 410,24 820,0 L 820,340 Q 410,316 0,340 Z" fill="url(#bezelGrad)" stroke="#111" strokeWidth="1" />
                                <path d="M 12,14 Q 410,34 808,14 L 808,326 Q 410,306 12,326 Z" fill="url(#screenGrad)" />
                                <path d="M 12,14 Q 410,34 808,14 L 808,326 Q 410,306 12,326 Z" fill="url(#screenGlow)" />
                                <path d="M 12,14 Q 410,34 808,14 L 808,140 Q 410,160 12,140 Z" fill="url(#glossGrad)" />

                                <mask id="scanlineMask">
                                    <rect x="0" y="0" width="820" height="440" fill="white" />
                                    {Array.from({length: 80}).map((_, i) => (
                                        <rect key={i} x="12" y={14 + i * 4} width="796" height="1" fill="black" fillOpacity="0.15" />
                                    ))}
                                </mask>
                                <path d="M 12,14 Q 410,34 808,14 L 808,326 Q 410,306 12,326 Z" fill="rgba(255,255,255,0.03)" mask="url(#scanlineMask)" />

                                <path d="M 0,0 Q 410,24 820,0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                                <path d="M 0,340 Q 410,316 820,340" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                                <path d="M 370,335 L 390,395 L 430,395 L 450,335 Z" fill="#222" />
                                <path d="M 390,395 L 430,395 L 440,410 L 380,410 Z" fill="#151515" />
                                <ellipse cx="410" cy="415" rx="160" ry="18" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1" />
                                <ellipse cx="410" cy="412" rx="155" ry="15" fill="#111" />
                                
                                <rect x="390" y="318" width="40" height="12" rx="2" fill="#0a0a0a" />
                                <text x="410" y="326" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#333" fontFamily="Arial" letterSpacing="2">BRAIN</text>

                                <g opacity="0.4">
                                    <path d="M 40,60 L 40,40 L 60,40" fill="none" stroke={isAlert ? "#ef4444" : "#eab308"} strokeWidth="2" />
                                    <path d="M 760,40 L 780,40 L 780,60" fill="none" stroke={isAlert ? "#ef4444" : "#eab308"} strokeWidth="2" />
                                    <path d="M 40,280 L 40,300 L 60,300" fill="none" stroke={isAlert ? "#ef4444" : "#eab308"} strokeWidth="2" />
                                    <path d="M 760,300 L 780,300 L 780,280" fill="none" stroke={isAlert ? "#ef4444" : "#eab308"} strokeWidth="2" />
                                </g>
                            </svg>

                            {/* Content Overlays */}
                            <div style={{ position: 'absolute', top: '48px', left: '55px', right: '55px', bottom: '110px', zIndex: 5, display: 'flex', gap: '25px', padding: '15px 20px', overflow: 'hidden' }}>
                                {/* Left Column: Brain + Status */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: '180px' }}>
                                    <div style={{ transform: 'scale(0.75)', transformOrigin: 'center center' }}>
                                        <CerberusVisual isListening={isListening} isThinking={isThinking} isAlert={isAlert} isSpeaking={isSpeaking} />
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '5px' }}>
                                        <h3 style={{ fontWeight: 'bold', color: isAlert ? '#ef4444' : isThinking ? '#38bdf8' : '#fff', fontSize: '0.9rem', textTransform: isThinking ? 'uppercase' : 'none', letterSpacing: '1px', margin: 0 }}>
                                            {isThinking ? 'Processando...' : isListening ? (audioLevel > 5 ? 'Escutando...' : 'Aguardando...') : 'Cérbero'}
                                        </h3>
                                        <p style={{ color: '#9ca3af', fontSize: '10px', margin: '4px 0 0', lineHeight: '1.4', maxWidth: '140px' }}>
                                            {isAlert ? 'Alerta Urgente!' : isThinking ? 'Analisando diretivas...' : 'Comando de voz ativo.'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        {isSpeaking && (
                                            <button onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Mute">
                                                <Square size={14} fill="currentColor" />
                                            </button>
                                        )}
                                        <button onClick={() => { playSystemSound('close'); speak("Desativando sistemas neurais."); setTimeout(() => setIsHibernated(true), 1500); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Hibernate">
                                            <Power size={16} />
                                        </button>
                                        <button onClick={() => { setIsVisible(false); playSystemSound('close'); }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Close HUD">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

                                {/* Right Column: Chat/Interaction */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(234, 179, 8, 0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(234, 179, 8, 0.15)', marginBottom: '2px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%', boxShadow: '0 0 8px #eab308' }} />
                                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#eab308', letterSpacing: '0.5px' }}>BETA / EM DESENVOLVIMENTO</span>
                                        </div>
                                        <span style={{ fontSize: '8px', color: '#6b7280' }}>v2.4.0-neural</span>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}><VoiceVisualizer /></div>

                                    {currentTranscript && isListening && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#fef08a', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(234, 179, 8, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{"\""}{currentTranscript}...{"\""}</motion.div>
                                    )}

                                    {lastCommand && !isListening && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1, borderColor: isThinking ? ['rgba(56,189,248,0.2)','rgba(56,189,248,0.8)','rgba(56,189,248,0.2)'] : 'rgba(234,179,8,0.2)', boxShadow: isThinking ? ['0 0 0px rgba(56,189,248,0)','0 0 15px rgba(56,189,248,0.3)','0 0 0px rgba(56,189,248,0)'] : 'none' }} transition={isThinking ? { duration: 1.5, repeat: Infinity } : {}} style={{ background: isThinking ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.1)', border: '1px solid', padding: '6px 15px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}><Terminal size={12} style={{ color: isThinking ? '#38bdf8' : '#eab308', minWidth: '12px' }} /><span style={{ color: isThinking ? '#38bdf8' : '#eab308', fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastCommand}</span></motion.div>
                                    )}

                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', color: '#d1d5db', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', paddingRight: '5px' }}>
                                        {chatHistory.length > 0 ? chatHistory.map((msg, idx) => (
                                            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: `1px solid ${msg.role === 'user' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`, padding: '10px 14px', borderRadius: '12px', maxWidth: '90%', wordBreak: 'break-word', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>{msg.role === 'ai' ? <div className="prose-sm prose-invert" style={{ fontSize: '0.75rem' }}><ReactMarkdown>{msg.text}</ReactMarkdown></div> : <span style={{ color: '#fef08a' }}>{msg.text}</span>}</div>
                                        )) : (
                                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, gap: '8px' }}><div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}><p style={{ margin: 0, fontSize: '11px' }}>Sistemas Prontos.</p><p style={{ margin: 0, fontSize: '9px', marginTop: '4px' }}>Diga {"\""}Cérbero{"\""} ou clique no botão para testar.</p></div></div>
                                        )}
                                    </div>

                                    {hasSupport && (
                                        <motion.button 
                                            whileHover={{ scale: 1.02, boxShadow: isListening ? '0 8px 25px rgba(239, 68, 68, 0.4)' : '0 8px 25px rgba(234, 179, 8, 0.4)' }} 
                                            whileTap={{ scale: 0.98 }} 
                                            onClick={startListening} 
                                            disabled={isListening} 
                                            style={{ 
                                                width: '95%', 
                                                margin: '0 auto',
                                                padding: '10px', 
                                                borderRadius: '12px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '10px', 
                                                border: 'none', 
                                                background: isListening ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', 
                                                color: isListening ? '#fff' : '#000', 
                                                fontWeight: '900', 
                                                fontSize: '0.8rem', 
                                                letterSpacing: '1px', 
                                                cursor: isListening ? 'default' : 'pointer', 
                                                outline: 'none', 
                                                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', 
                                                flexShrink: 0, 
                                                boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 6px 20px rgba(234, 179, 8, 0.25)' 
                                            }}
                                        >
                                            {isListening ? (
                                                <>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [4, 18, 4] }} transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.1 }} style={{ width: '3px', background: '#fff', borderRadius: '9999px' }} />)}
                                                    </div>
                                                    <span>GRAVANDO...</span>
                                                </>
                                            ) : (
                                                <><Mic size={20} /><span>FALAR COMANDO</span></>
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trigger Button — Top Right (Only visible when HUD is closed) */}
            <AnimatePresence>
                {!isVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        style={{ 
                            position: 'fixed', 
                            top: '30px', 
                            right: '30px', 
                            zIndex: 100000,
                            pointerEvents: 'auto'
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(234, 179, 8, 0.6)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { 
                                setIsVisible(true); 
                                playSystemSound('intro');
                            }}
                            style={{
                                position: 'relative',
                                width: '50px',
                                height: '50px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                border: '2px solid #fff',
                                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(234, 179, 8, 0.3)',
                                cursor: 'pointer',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Command size={22} color="#000" />
                            </div>

                            {/* Proximity / Status Glow */}
                            <motion.span 
                                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '9999px',
                                    border: '1px solid rgba(234, 179, 8, 0.6)',
                                    pointerEvents: 'none'
                                }}
                            />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
