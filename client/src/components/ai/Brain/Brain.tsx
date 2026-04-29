"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';
import { aiService } from '@/lib/aiService';
import { useSocket } from '@/context/SocketContext';

export default function Brain() {
    const router = useRouter();
    const { socket } = useSocket();
    
    const [isVisible, setIsVisible] = useState(false);
    const [isHibernated, setIsHibernated] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

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
                // Inteligência Contextual via Gemini
                const result = await aiService.brainCommand(transcript);
                speak(result.reply);
                toast.info("BRAIN processou sua consulta.");
            }
        } catch (error) {
            console.error("Brain Error:", error);
            speak("Peço desculpas, Mestre. Houve uma falha nos meus circuitos neurais.");
        } finally {
            setIsThinking(false);
        }
    }, [router, speak]);

    const { isListening, startListening, hasSupport } = useSpeechRecognition(handleCommand);



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
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
                            ? Math.max(4, (audioLevel / 100) * (32 - Math.abs(i - 6) * 3))
                            : isSpeaking 
                                ? [8, Math.random() * 20 + 8, 8] 
                                : 4,
                        opacity: isSpeaking || isListening ? 1 : 0.2
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
        console.log("-> Posicionamento: Bottom-Left (Above Aura)");
    }, [hasSupport]);

    if (isHibernated) return null;

    return (
        <div style={{ position: 'fixed', top: '80px', left: '20px', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            {/* Modal de Feedback do Brain */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${isAlert ? '#ef4444' : 'rgba(255, 215, 0, 0.3)'}`,
                            padding: '16px',
                            borderRadius: '20px',
                            boxShadow: isAlert ? '0 15px 40px rgba(239, 68, 68, 0.3)' : '0 15px 40px rgba(0, 0, 0, 0.5)',
                            width: '260px',
                            transition: 'all 0.5s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                fontWeight: 'bold', 
                                letterSpacing: '0.1em', 
                                fontSize: '9px', 
                                textTransform: 'uppercase', 
                                color: isAlert ? '#ef4444' : '#eab308' 
                            }}>
                                <Command size={12} />
                                {isAlert ? 'Urgent' : 'Neural'}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => {
                                        speak("Desativando sistemas neurais. Até logo, Mestre.");
                                        setTimeout(() => setIsHibernated(true), 1500);
                                    }}
                                    title="Desligar BRAIN"
                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
                                >
                                    <Power size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsVisible(false)} 
                                    style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ scale: '0.8' }}>
                                <CerberusVisual 
                                isListening={isListening} 
                                isThinking={isThinking} 
                                isAlert={isAlert} 
                                isSpeaking={isSpeaking} 
                            />
                            </div>
                            
                            <VoiceVisualizer />

                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ 
                                    fontWeight: 'bold', 
                                    marginBottom: '2px', 
                                    color: isAlert ? '#ef4444' : '#fff',
                                    fontSize: '0.85rem'
                                }}>
                                    {isThinking ? "Consultando..." : isListening ? "Ouvindo..." : "Cérbero"}
                                </h3>
                                <p style={{ color: '#9ca3af', fontSize: '10px', padding: '0 4px', lineHeight: '1.4' }}>
                                    {isAlert ? "Alerta urgente recebido." : "Diga seu comando, Mestre."}
                                </p>
                            </div>

                            {lastCommand && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        background: 'rgba(234, 179, 8, 0.1)',
                                        border: '1px solid rgba(234, 179, 8, 0.2)',
                                        padding: '8px 16px',
                                        borderRadius: '9999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Terminal size={12} style={{ color: '#eab308' }} />
                                    <span style={{ color: '#eab308', fontSize: '0.75rem', fontFamily: 'monospace' }}>{lastCommand}</span>
                                </motion.div>
                            )}

                            {hasSupport && (
                                <button
                                    onClick={startListening}
                                    disabled={isListening}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        transition: 'all 0.3s ease',
                                        border: isListening ? '1px solid rgba(234, 179, 8, 0.5)' : 'none',
                                        background: isListening ? 'rgba(234, 179, 8, 0.2)' : '#eab308',
                                        color: isListening ? '#eab308' : '#000',
                                        fontWeight: 'bold',
                                        cursor: isListening ? 'default' : 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {isListening ? (
                                        <>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [4, 12, 4] }}
                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                        style={{ width: '4px', background: '#eab308', borderRadius: '9999px' }}
                                                    />
                                                ))}
                                            </div>
                                            <span>Ouvindo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic size={20} />
                                            <span>Falar Comando</span>
                                        </>
                                    )}
                                </button>
                            )}
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
                    width: '56px', 
                    height: '56px', 
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
                            width: '32px',
                            height: '32px',
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
                            <Command size={18} />
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
    );
}
