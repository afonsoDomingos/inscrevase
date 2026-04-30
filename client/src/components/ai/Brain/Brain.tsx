"use client";

import { useState, useCallback, useEffect } from 'react';
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
    }, [hasSupport, isVisible, isListening, startListening, speak]);

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
    }, [socket, speak]);

    useEffect(() => {
        console.log("%c🧠 [BRAIN] Interface Neural Ativa", "color: #FFD700; font-weight: bold; font-size: 14px;");
        console.log("-> Suporte de Voz:", hasSupport);
        console.log("-> Posicionamento: Top-Left (Floating)");
    }, [hasSupport]);

    if (isHibernated) return null;
    if (!pathname?.startsWith('/dashboard')) return null;

    return (
        <div style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 99999, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px',
            pointerEvents: 'none' // Allow clicking through the container when not visible
        }}>
            <div style={{ pointerEvents: 'auto' }}> {/* Re-enable events for children */}
            {/* Monitor SVG + Conteúdo */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30 }}
                        style={{ position: 'relative', width: '820px', height: '440px', cursor: 'grab', filter: isAlert ? 'drop-shadow(0 0 30px rgba(239,68,68,0.5))' : 'drop-shadow(0 0 20px rgba(234,179,8,0.15))' }}
                        whileDrag={{ cursor: 'grabbing', scale: 1.01 }}
                    >
                        {/* SVG Monitor Frame */}
                        <svg width="820" height="440" viewBox="0 0 820 440" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                            <defs>
                                <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#2e2e2e" />
                                    <stop offset="100%" stopColor="#181818" />
                                </linearGradient>
                                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(0,0,0,0.97)" />
                                    <stop offset="14%" stopColor={isAlert ? "rgba(25,4,4,0.82)" : "rgba(4,7,18,0.82)"} />
                                    <stop offset="86%" stopColor={isAlert ? "rgba(25,4,4,0.82)" : "rgba(4,7,18,0.82)"} />
                                    <stop offset="100%" stopColor="rgba(0,0,0,0.97)" />
                                </linearGradient>
                                <linearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
                                    <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            {/* Outer bezel — concave inward (Odyssey G9 shape) */}
                            <path d="M 2,32 Q 410,6 818,32 L 818,348 Q 410,374 2,348 Z" fill="url(#bezelGrad)" />

                            {/* Screen inner glass */}
                            <path d="M 20,45 Q 410,20 800,45 L 800,335 Q 410,360 20,335 Z" fill="url(#screenGrad)" />

                            {/* Glossy top-half reflection */}
                            <path d="M 20,45 Q 410,20 800,45 L 800,190 Q 410,195 20,190 Z" fill="url(#glossGrad)" />

                            {/* Scanlines */}
                            {Array.from({length: 60}).map((_, i) => (
                                <line key={i} x1="20" y1={50 + i * 5} x2="800" y2={50 + i * 5} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                            ))}

                            {/* LED accent strip — top */}
                            <path d="M 20,45 Q 410,20 800,45" fill="none" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.5)"} strokeWidth="1.5" />
                            {/* LED accent strip — bottom */}
                            <path d="M 20,335 Q 410,360 800,335" fill="none" stroke={isAlert ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"} strokeWidth="1" />

                            {/* HUD corner markers */}
                            <line x1="48" y1="68" x2="72" y2="68" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="48" y1="68" x2="48" y2="92" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="748" y1="68" x2="772" y2="68" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="772" y1="68" x2="772" y2="92" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="48" y1="310" x2="72" y2="310" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="48" y1="288" x2="48" y2="310" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="748" y1="310" x2="772" y2="310" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>
                            <line x1="772" y1="288" x2="772" y2="310" stroke={isAlert ? "rgba(239,68,68,0.7)" : "rgba(234,179,8,0.6)"} strokeWidth="2"/>

                            {/* Stand neck */}
                            <path d="M 374,348 L 390,388 L 430,388 L 446,348 Z" fill="#222" />
                            <rect x="374" y="345" width="72" height="6" fill="#2e2e2e" rx="2" />

                            {/* Stand base */}
                            <ellipse cx="410" cy="410" rx="170" ry="20" fill="#1a1a1a" />
                            <ellipse cx="410" cy="408" rx="170" ry="20" fill="none" stroke="#2e2e2e" strokeWidth="1.5" />
                        </svg>

                        {/* Screen Content — 2-column ultra-wide layout */}
                        <div style={{ position: 'absolute', top: '52px', left: '58px', right: '58px', bottom: '100px', zIndex: 5, display: 'flex', gap: '20px', padding: '10px 16px', overflow: 'hidden' }}>

                            {/* Left Column: Brain + Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '160px' }}>
                                <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}>
                                    <CerberusVisual isListening={isListening} isThinking={isThinking} isAlert={isAlert} isSpeaking={isSpeaking} />
                                </div>
                                <h3 style={{ fontWeight: 'bold', color: isAlert ? '#ef4444' : isThinking ? '#38bdf8' : '#fff', fontSize: '0.8rem', textTransform: isThinking ? 'uppercase' : 'none', letterSpacing: isThinking ? '1px' : '0', margin: 0, marginTop: '-30px', textAlign: 'center' }}>
                                    {isThinking ? 'A Processar...' : isListening ? (audioLevel > 5 ? 'A Escutar...' : 'Aguardando...') : 'Cérbero'}
                                </h3>
                                <p style={{ color: '#6b7280', fontSize: '9px', textAlign: 'center', margin: 0, lineHeight: '1.3' }}>
                                    {isAlert ? 'Alerta urgente.' : isThinking ? 'A consultar dados...' : 'Diga o comando, Mestre.'}
                                </p>
                                {/* Header buttons */}
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '8px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: isAlert ? '#ef4444' : '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Command size={10} /></motion.div>
                                        {isAlert ? 'URGENT' : 'NEURAL'}
                                    </div>
                                    {isSpeaking && (
                                        <button onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }} title="Silenciar" style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                                            <Square size={10} fill="currentColor" />
                                        </button>
                                    )}
                                    <button onClick={() => { speak("Desativando sistemas neurais. Até logo, Mestre."); setTimeout(() => setIsHibernated(true), 1500); }} title="Desligar" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8, padding: 0 }}>
                                        <Power size={12} />
                                    </button>
                                    <button onClick={() => setIsVisible(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

                            {/* Right Column: Visualizer + Chat + Controls */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                                <VoiceVisualizer />

                                {/* Live transcript */}
                                {currentTranscript && isListening && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#fef08a', fontSize: '0.78rem', fontStyle: 'italic', background: 'rgba(234,179,8,0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px dotted rgba(234,179,8,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        &quot;{currentTranscript}...&quot;
                                    </motion.div>
                                )}

                                {/* Last command badge */}
                                {lastCommand && !isListening && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, borderColor: isThinking ? ['rgba(56,189,248,0.2)','rgba(56,189,248,0.8)','rgba(56,189,248,0.2)'] : 'rgba(234,179,8,0.2)', boxShadow: isThinking ? ['0 0 0px rgba(56,189,248,0)','0 0 12px rgba(56,189,248,0.5)','0 0 0px rgba(56,189,248,0)'] : 'none' }}
                                        transition={isThinking ? { duration: 1.5, repeat: Infinity } : {}}
                                        style={{ background: isThinking ? 'rgba(56,189,248,0.12)' : 'rgba(234,179,8,0.08)', border: '1px solid', padding: '4px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}
                                    >
                                        <Terminal size={10} style={{ color: isThinking ? '#38bdf8' : '#eab308', minWidth: '10px' }} />
                                        <span style={{ color: isThinking ? '#38bdf8' : '#eab308', fontSize: '0.7rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastCommand}</span>
                                    </motion.div>
                                )}

                                {/* Chat history */}
                                {chatHistory.length > 0 && (
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem', color: '#d1d5db', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
                                        {chatHistory.map((msg, idx) => (
                                            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'rgba(234,179,8,0.12)' : 'rgba(55,65,81,0.35)', border: `1px solid ${msg.role === 'user' ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.04)'}`, padding: '5px 10px', borderRadius: '10px', maxWidth: '85%', wordBreak: 'break-word' }}>
                                                {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : <span style={{ color: '#fef08a' }}>{msg.text}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Mic button */}
                                {hasSupport && (
                                    <button onClick={startListening} disabled={isListening} style={{ width: '100%', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: isListening ? '1px solid rgba(234,179,8,0.5)' : 'none', background: isListening ? 'rgba(234,179,8,0.15)' : '#eab308', color: isListening ? '#eab308' : '#000', fontWeight: 'bold', fontSize: '0.8rem', cursor: isListening ? 'default' : 'pointer', outline: 'none', transition: 'all 0.3s ease', flexShrink: 0 }}>
                                        {isListening ? (
                                            <>
                                                <div style={{ display: 'flex', gap: '3px' }}>
                                                    {[1,2,3].map(i => <motion.div key={i} animate={{ height: [3, 10, 3] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} style={{ width: '3px', background: '#eab308', borderRadius: '9999px' }} />)}
                                                </div>
                                                <span>A Ouvir...</span>
                                            </>
                                        ) : (
                                            <><Mic size={16} /><span>Falar Comando</span></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button (O Cérebro) */}
            <motion.button
                whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVisible(!isVisible)}
                style={{
                    position: 'relative',
                    padding: '3px',
                    borderRadius: '9999px',
                    background: isVisible ? 'var(--gold-gradient)' : 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
                    border: `2px solid ${isVisible ? '#fff' : '#FFD700'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: isVisible ? '0 0 30px rgba(255, 215, 0, 0.6)' : '0 10px 25px rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '9999px', 
                    overflow: 'hidden', 
                    background: 'linear-gradient(to bottom right, #111827, #000)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <div style={{ position: 'relative' }}>
                         {/* Mini Cérbero / Brain Icon */}
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '9999px',
                            border: '2px solid',
                            borderColor: isVisible ? '#eab308' : '#374151',
                            transform: isVisible ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.7s ease'
                        }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isVisible ? '#eab308' : '#374151',
                            transition: 'all 0.7s ease'
                        }}>
                            <Command size={14} />
                        </div>
                    </div>
                </div>

                {/* Pulse Effect */}
                {!isVisible && (
                    <motion.span 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '9999px',
                            border: '1px solid rgba(234, 179, 8, 0.5)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </motion.button>
            </div>
        </div>
    );
}
