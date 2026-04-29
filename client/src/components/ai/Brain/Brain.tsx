"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';
import { aiService } from '@/lib/aiService';
import { useSocket } from '@/context/SocketContext';
import { useEffect } from 'react';

export default function Brain() {
    const router = useRouter();
    const { socket } = useSocket();
    
    // Mover para o topo para disponibilidade global no componente
    const handleCommand = async (transcript: string) => {
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
    };

    const { isListening, startListening, hasSupport } = useSpeechRecognition(handleCommand);

    const [isVisible, setIsVisible] = useState(false);
    const [isHibernated, setIsHibernated] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = (text: string) => {
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
    };

    // Componente de Visualização de Voz (Barras de Gráfico)
    const VoiceVisualizer = () => (
        <div className="flex items-end justify-center gap-[3px] h-8 w-full px-4">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        height: isSpeaking || isListening ? [8, Math.random() * 24 + 8, 8] : 4,
                        opacity: isSpeaking || isListening ? 1 : 0.3
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 0.5 + Math.random() * 0.3,
                        delay: i * 0.05
                    }}
                    className={`w-1.5 rounded-full ${isAlert ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ boxShadow: isSpeaking || isListening ? `0 0 10px ${isAlert ? '#ef4444' : '#eab308'}` : 'none' }}
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
    }, [hasSupport, isVisible, isListening, startListening]);

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
    }, [socket]);

    useEffect(() => {
        console.log("🧠 [BRAIN] Interface Neural Montada. Suporte de Voz:", hasSupport);
    }, [hasSupport]);

    if (isHibernated) return null;

    return (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col items-end gap-4">
            {/* Modal de Feedback do Brain */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className={`bg-black/95 backdrop-blur-2xl border-2 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-80 mt-4 transition-colors duration-500 ${
                            isAlert ? 'border-red-500 shadow-red-500/20' : 'border-yellow-500/30'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className={`flex items-center gap-2 font-bold tracking-widest text-[10px] uppercase ${isAlert ? 'text-red-500' : 'text-yellow-500'}`}>
                                <Command size={14} />
                                {isAlert ? 'Urgent Alert' : 'Neural Interface'}
                            </div>
                            <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <CerberusVisual isListening={isListening || isThinking || isAlert || isSpeaking} />
                            
                            <VoiceVisualizer />

                            <div className="text-center">
                                <h3 className={`font-bold mb-1 ${isAlert ? 'text-red-500' : 'text-white'}`}>
                                    {isThinking ? "Consultando Gemini..." : isListening ? "Ouvindo Mestre..." : isAlert ? "Atenção Requerida" : "Cérbero Vigilante"}
                                </h3>
                                <p className="text-gray-500 text-[11px] px-2 leading-relaxed">
                                    {!hasSupport 
                                        ? "Seu navegador não suporta comandos de voz. Tente usar o Chrome ou Edge." 
                                        : isAlert 
                                            ? "Uma nova notificação importante acaba de chegar." 
                                            : "Como posso otimizar seus resultados hoje, Mestre?"}
                                </p>
                            </div>

                            {lastCommand && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 py-2 px-4 rounded-full flex items-center gap-2"
                                >
                                    <Terminal size={12} className="text-yellow-500" />
                                    <span className="text-yellow-500 text-xs font-mono">{lastCommand}</span>
                                </motion.div>
                            )}

                            {hasSupport && (
                                <button
                                    onClick={startListening}
                                    disabled={isListening}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                                        isListening 
                                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' 
                                        : 'bg-yellow-500 text-black font-bold hover:bg-yellow-400'
                                    }`}
                                >
                                    {isListening ? (
                                        <>
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [4, 12, 4] }}
                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                        className="w-1 bg-yellow-500 rounded-full"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVisible(!isVisible)}
                className={`relative group p-1 rounded-full bg-black border-2 transition-colors duration-500 ${
                    isVisible ? 'border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.6)]' : 'border-yellow-500/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                }`}
            >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    <div className="relative">
                         {/* Mini Cérbero / Brain Icon */}
                        <div className={`w-8 h-8 rounded-full border-2 transition-all duration-700 ${
                            isVisible ? 'border-yellow-500 scale-110' : 'border-gray-700'
                        }`} />
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                            isVisible ? 'text-yellow-500' : 'text-gray-700'
                        }`}>
                            <Command size={18} />
                        </div>
                    </div>
                </div>

                {/* Pulse Effect */}
                {!isVisible && (
                    <span className="absolute inset-0 rounded-full border border-yellow-500/50 animate-ping" />
                )}
            </motion.button>
        </div>
    );
}
