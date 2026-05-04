"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command, Power, Square, Copy, Check } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';
import { aiService } from '@/lib/aiService';
import { useSocket } from '@/context/SocketContext';
import { authService, type UserData } from '@/lib/authService';

// Componente para Efeito de Digitação
const TypewriterText = ({ text, speed = 8 }: { text: string, speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.substring(0, i));
            i++;
            if (i > text.length) {
                clearInterval(timer);
                setIsComplete(true);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <ReactMarkdown 
            components={{ 
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                p: ({node, ...props}) => <p style={{ margin: 0, paddingBottom: '6px', color: '#e2e8f0' }} {...props} />, 
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                strong: ({node, ...props}) => <strong style={{ color: '#fff', fontWeight: 800 }} {...props} />, 
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({node, ...props}) => {
                    const isExternal = props.href?.startsWith('http');
                    return (
                        <a 
                            style={{ color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }} 
                            target={isExternal ? "_blank" : "_self"}
                            rel={isExternal ? "noopener noreferrer" : ""}
                            {...props} 
                        />
                    );
                }
            }}
        >
            {isComplete ? text : displayedText}
        </ReactMarkdown>
    );
};

export default function Brain() {
    const router = useRouter();
    const pathname = usePathname();
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [isVisible, setIsVisible] = useState(false);
    const [isHibernated, setIsHibernated] = useState(false);
    const [voiceMode, setVoiceMode] = useState<'local' | 'premium'>('local');
    const [preferredVoiceName, setPreferredVoiceName] = useState("");
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const [lastCommand, setLastCommand] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

    useEffect(() => {
        const fetchVoiceMode = async () => {
            try {
                const data = await aiService.getVoiceMode();
                setVoiceMode(data.mode);
                setPreferredVoiceName(data.voiceName || "");
            } catch {
                console.warn("Brain: Usando modo local por padrão.");
            }
        };
        fetchVoiceMode();
    }, [isVisible]);

    // Persistência de Estado (Contexto e Visibilidade)
    useEffect(() => {
        const savedHistory = localStorage.getItem('brain_chat_history');
        const savedVisibility = localStorage.getItem('brain_is_visible');
        
        if (savedHistory) {
            try {
                setChatHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Erro ao carregar histórico do Brain:", e);
            }
        }
        
        if (savedVisibility === 'true') {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('brain_chat_history', JSON.stringify(chatHistory));
        localStorage.setItem('brain_is_visible', isVisible.toString());
    }, [chatHistory, isVisible]);
    const [isMobile, setIsMobile] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [textInput, setTextInput] = useState("");
    const [user, setUser] = useState<UserData | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const triggerAlert = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
        if (type === 'error') setIsAlert(true);
        
        // Inject as inline system message in chat instead of floating overlay
        setChatHistory(prev => [...prev, { role: 'system' as 'ai', text: `__SYSTEM__${type}__${message}` }]);
        
        if (type === 'error') {
            setTimeout(() => setIsAlert(false), 4000);
        }
    }, []);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, [pathname, isVisible]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isThinking]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const fallbackToBrowserTTS = useCallback((text: string, onEndCallback?: () => void) => {
        if (!window.speechSynthesis) {
            if (onEndCallback) onEndCallback();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-PT';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            console.log("%c🔊 [VOICE] Usando síntese local (Browser)...", "color: #38bdf8;");
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };

        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        const ptPTVoices = availableVoices.filter(v => v.lang === 'pt-PT' || v.lang === 'pt_PT');
        
        const preferredVoice = (preferredVoiceName && availableVoices.find(v => v.name === preferredVoiceName)) ||
                               ptPTVoices.find(v => v.name.toLowerCase().includes('natural')) ||
                               ptPTVoices.find(v => v.name.toLowerCase().includes('online')) ||
                               ptPTVoices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || 
                               ptPTVoices[0] || availableVoices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        // Timeout para evitar o bug do Chrome onde o cancel() imediato bloqueia o speak()
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);
    }, [voices, preferredVoiceName]);

    const speak = useCallback(async (text: string, onEndCallback?: () => void) => {
        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/\[\[GOTO:.*?\]\]/g, '')
            .replace(/\[\[ACTION:.*?\]\]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/#/g, '');

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        if (voiceMode === 'local') {
            fallbackToBrowserTTS(cleanText, onEndCallback);
            return;
        }

        try {
            console.log("%c💎 [VOICE] Solicitando Matriz Neural Premium...", "color: #facc15;");
            const audioBlob = await aiService.generateSpeech(cleanText, 'openai', preferredVoiceName || 'onyx');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (onEndCallback) onEndCallback();
            };
            audio.onerror = () => {
                fallbackToBrowserTTS(cleanText, onEndCallback);
            };

            await audio.play();
        } catch {
            console.warn("⚠️ Falha no áudio premium, recorrendo ao browser...");
            fallbackToBrowserTTS(cleanText, onEndCallback);
        }
    }, [voiceMode, fallbackToBrowserTTS]);

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
            speak("Entendido. Silenciando.");
            triggerAlert("A fala foi interrompida.");
            return;
        }

        // Comando Especial: Ler resposta anterior na íntegra
        if (lowerTranscript.includes('lê para mim') || lowerTranscript.includes('le para mim') || lowerTranscript.includes('lê tudo') || lowerTranscript.includes('leia tudo')) {
            const lastAiMessage = [...chatHistory].reverse().find(m => m.role === 'ai');
            if (lastAiMessage) {
                speak(lastAiMessage.text);
                triggerAlert("Lendo a resposta completa...");
            } else {
                speak("Ainda não temos uma resposta para eu ler, Mestre.");
            }
            setIsThinking(false);
            return;
        }

        // Comando Especial: Fala Promocional (/brainpromo)
        if (lowerTranscript.includes('/brainpromo') || lowerTranscript.includes('fala promocional') || lowerTranscript.includes('promoção da plataforma')) {
            const promoText = `“Queres organizar eventos de forma simples, profissional e sem dores de cabeça?
Então deixa-me apresentar-te a Inscreva-se.

A Inscreva-se é uma plataforma completa para criação e gestão de eventos — desde mentorias, palestras, masterclasses até lançamentos de livros e muito mais.

Com ela, podes criar o teu evento em poucos minutos, gerir participantes, automatizar toda a comunicação e ainda receber pagamentos tanto a nível nacional como internacional.

Tudo fica centralizado num único lugar — mais organização, mais controlo e muito mais profissionalismo.

Se és mentor, especialista ou empresa e queres escalar os teus eventos sem complicações, a Inscreva-se é a solução ideal para ti.

Experimenta agora e leva os teus eventos para o próximo nível.”`;
            
            setChatHistory(prev => [...prev, { role: 'ai', text: promoText + "\n\n**Nota:** Mestre, preparei também uma [apresentação visual completa em /promo](/promo)." }]);
            speak(promoText);
            setIsThinking(false);
            return;
        }


        // Comando Especial: Reconhecimento do Criador
        if (lowerTranscript.includes('quem te criou') || lowerTranscript.includes('quem é o teu criador') || lowerTranscript.includes('afonso domingos')) {
            const creatorInfo = "Fui orquestrado e concebido por **Afonso Domingos**, o Fundador da Inscreva-se e da RPA Moçambique. Ele é o Mestre Supremo e o visionário por trás da minha existência e de todo este ecossistema de gestão de eventos.";
            setChatHistory(prev => [...prev, { role: 'ai', text: creatorInfo + "\n\n[Ver Perfil do Criador](https://inscreva-se.com/equipe/afonso-domingos)" }]);
            speak(creatorInfo);
            setIsThinking(false);
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
                triggerAlert("BRAIN entrou em hibernação.");
            }, 2000);
            setIsThinking(false);
            return;
        }

        // Helpers para Scroll Universal
        const performSuperScroll = (amount: number) => {
            // Tenta o scroll tradicional primeiro
            window.scrollBy({ top: amount, behavior: 'smooth' });
            
            // O Dashboard e outras páginas podem ter scroll preso num contentor main ou flex
            const mainEl = document.querySelector('main');
            if (mainEl) mainEl.scrollBy({ top: amount, behavior: 'smooth' });
            
            // Varre o DOM para encontrar todos os contentores que são nativamente "scrolláveis"
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                if ((style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto') && el.scrollHeight > el.clientHeight) {
                    el.scrollBy({ top: amount, behavior: 'smooth' });
                }
            });
        };

        // Comando Especial: Controle Físico da Tela (Scroll)
        if (lowerTranscript.includes('descer a página') || lowerTranscript.includes('vai para baixo') || lowerTranscript.includes('lá para baixo') || lowerTranscript.includes('faz scroll para baixo') || lowerTranscript.includes('rola para baixo') || lowerTranscript.includes('desce um pouco')) {
            performSuperScroll(window.innerHeight * 0.8);
            speak("A descer a página, Mestre.");
            setIsThinking(false);
            return;
        }

        if (lowerTranscript.includes('subir a página') || lowerTranscript.includes('vai para cima') || lowerTranscript.includes('lá para cima') || lowerTranscript.includes('faz scroll para cima') || lowerTranscript.includes('rola para cima') || lowerTranscript.includes('sobe um pouco')) {
            performSuperScroll(-window.innerHeight * 0.8);
            speak("Subindo a página, Mestre.");
            setIsThinking(false);
            return;
        }

        // Mapeamento Abrangente de Rotas (Atalhos Rápidos)
        const routes: Record<string, { path: string, response: string, keywords: string[] }> = {
            '/dashboard/mentor?tab=overview': { path: '/dashboard/mentor?tab=overview', response: 'Entendido, Mestre. A carregar a sua visão geral.', keywords: ['visão geral', 'resumo', 'dashboard mentor', 'painel mentor'] },
            '/dashboard/mentor?tab=forms': { path: '/dashboard/mentor?tab=forms', response: 'A abrir os seus eventos e formulários.', keywords: ['meus eventos', 'meus formulários', 'gerir eventos'] },
            '/dashboard/mentor?tab=submissions': { path: '/dashboard/mentor?tab=submissions', response: 'A consultar a lista de participantes.', keywords: ['ver inscrições', 'participantes', 'lista de inscritos'] },
            '/dashboard/admin?tab=overview': { path: '/dashboard/admin?tab=overview', response: 'A aceder ao centro de comando administrativo.', keywords: ['painel admin', 'dashboard admin', 'estatísticas globais'] },
            '/dashboard/admin?tab=users': { path: '/dashboard/admin?tab=users', response: 'A carregar a base de utilizadores da plataforma.', keywords: ['gestão de utilizadores', 'ver utilizadores', 'lista de pessoas'] },
            '/dashboard/perfil': { path: '/dashboard/perfil', response: 'A abrir o seu perfil profissional.', keywords: ['meu perfil', 'perfil profissional'] },
            '/explorar': { path: '/explorar', response: 'A carregar a página de exploração de eventos.', keywords: ['explorar', 'ver eventos', 'eventos públicos', 'todos os eventos'] },
            '/': { path: '/', response: 'A retornar à página inicial. Até breve, Mestre.', keywords: ['ir para home', 'sair da dashboard', 'página inicial', 'site'] }
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
                triggerAlert(foundEntry.response, 'success');
            } else if (lowerTranscript.includes('criar evento') || lowerTranscript.includes('novo evento')) {
                speak("Iniciando interface de criação de evento. O que deseja criar?");
                triggerAlert("Abrindo interface de criação...");
                window.dispatchEvent(new Event('open-create-event-modal'));
            } else {
                // Construção do contexto visual (Página atual e texto principal)
                let pageContext = `Rota atual: ${pathname}\n`;
                const mainContainer = document.querySelector('main') || document.body;
                if (mainContainer) {
                    // Extrai até 1500 caracteres de texto legível da tela para dar contexto à IA
                    pageContext += `Conteúdo visível no ecrã: ${mainContainer.innerText.substring(0, 1500)}`;
                }

                // Inteligência Contextual via Gemini (com Memória de Chat)
                const result = await aiService.brainCommand(transcript, pageContext, chatHistory);
                let reply = result.reply;

                // Auto-Navigation Logic
                const gotoMatch = reply.match(/\[\[GOTO:(.*?)\]\]/);
                if (gotoMatch) {
                    const navUrl = gotoMatch[1].trim();
                    reply = reply.replace(/\[\[GOTO:.*?\]\]/g, '').trim();
                    
                    // Navigate after a short delay
                    setTimeout(() => {
                        router.push(navUrl);
                        triggerAlert(`A orquestrar navegação para: ${navUrl}`, 'info');
                    }, 1500);
                }

                // Action Trigger Logic
                const actionMatch = reply.match(/\[\[ACTION:(.*?)\]\]/);
                if (actionMatch) {
                    const actionName = actionMatch[1].trim();
                    reply = reply.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
                    
                    // Dispatch the specific action event
                    setTimeout(() => {
                        window.dispatchEvent(new Event(`brain-action-${actionName}`));
                        triggerAlert(`A executar ação: ${actionName}`, 'success');
                    }, 1000);
                }

                setChatHistory(prev => [...prev, { role: 'user', text: transcript }, { role: 'ai', text: reply }]);
                
                // Inteligência Neural: Leitura completa da resposta sem interrupções
                speak(reply);
                
                triggerAlert("BRAIN processou sua consulta.");
            }
        } catch (error) {
            console.error("Brain Error:", error);
            const errorMessages = [
                "Peço desculpa, Mestre. Encontrei uma interferência nos meus subsistemas. Os nossos Engenheiros estão a trabalhar na resolução do problema.",
                "Houve uma falha na sincronização neural. Os nossos Engenheiros estão a trabalhar na resolução do problema.",
                "Mestre, encontrei uma barreira técnica imprevista. Os nossos Engenheiros estão a trabalhar na resolução do problema."
            ];
            const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
            speak(randomError);
            triggerAlert(error instanceof Error ? error.message : "Erro na matriz neural do Cérbero.", 'error');
        } finally {
            setIsThinking(false);
        }
    }, [router, speak, pathname, chatHistory, triggerAlert]);

    const { isListening, currentTranscript, startListening, hasSupport } = useSpeechRecognition(handleCommand);

    const introSound = useRef<HTMLAudioElement | null>(null);
    const closeSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        introSound.current = new Audio('/braindsound/1intro.mp3');
        closeSound.current = new Audio('/braindsound/2Fecho.mp3');
        introSound.current.load();
        closeSound.current.load();
        console.log("%c🎵 [AUDIO] Sons de sistema carregados.", "color: #a78bfa; font-weight: bold;");

        // Carregar vozes corretamente
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                console.log("%c🗣️ [VOICE] Vozes carregadas:", "color: #10b981;", availableVoices.length);
            }
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const playSystemSound = useCallback((type: 'intro' | 'close') => {
        // Áudios MP3 desativados para evitar conflito com a síntese de voz (TTS) do Gemini.
        // console.log(`%c🔔 [AUDIO] Executando som: ${type}`, "color: #fcd34d;");
        // const audio = type === 'intro' ? introSound.current : closeSound.current;
        // if (audio) {
        //     audio.currentTime = 0;
        //     audio.volume = 0.8;
        //     audio.play().catch(err => console.warn("%c⚠️ [AUDIO] Play bloqueado pelo browser.", "color: #fbbf24;", err));
        // }
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
    const VoiceVisualizer = () => {
        const barCount = 17;
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '40px', width: '100%', padding: '0 16px' }}>
                {[...Array(barCount)].map((_, i) => {
                    const centerOffset = Math.abs(i - (barCount - 1) / 2);
                    const maxHeight = Math.max(12, 36 - centerOffset * 4);
                    const midHeight = Math.max(8, 22 - centerOffset * 2.5);
                    
                    return (
                        <motion.div
                            key={i}
                            animate={{ 
                                height: isListening 
                                    ? Math.max(4, (audioLevel / 100) * 45 - centerOffset * 2)
                                    : isSpeaking 
                                        ? [4, maxHeight, midHeight, maxHeight * 0.85, 4] 
                                        : 4,
                                opacity: isSpeaking ? 1 : (isListening && audioLevel > 5) ? 1 : 0.3
                            }}
                            transition={
                                isSpeaking ? { 
                                    duration: 0.6 + (i % 3) * 0.2,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                    delay: centerOffset * 0.08
                                } : { 
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20
                                }
                            }
                            style={{ 
                                width: '4px', 
                                borderRadius: '9999px', 
                                background: isAlert ? '#ef4444' : '#eab308',
                                boxShadow: isSpeaking || (isListening && audioLevel > 10) ? `0 0 12px ${isAlert ? 'rgba(239,68,68,0.8)' : 'rgba(234,179,8,0.8)'}` : 'none' 
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    // Sistema de Ativação por Voz (Wake-Word)
    useEffect(() => {
        if (!hasSupport || isVisible) return;

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
                console.log("%c🤖 [WAKE-WORD] Cérbero detectado! Ativando HUD...", "color: #eab308; font-weight: bold;");
                if (!isVisible) {
                    setIsVisible(true);
                    playSystemSound('intro');
                    const greeting = user 
                        ? `Sim, Mestre. Estou às suas ordens.` 
                        : "Bem-vindo à Inscreva-se. Como posso ajudar hoje?";
                    speak(greeting, () => {
                        setTimeout(() => startListening(), 300);
                    });
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
    }, [hasSupport, isVisible, isListening, startListening, speak, playSystemSound, user]);

    // Monitoramento Proativo via Sockets
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: { title: string, content: string, type: string }) => {
            // Se for algo urgente ou pessoal, o Brain intervém
            setIsAlert(true);
            setIsVisible(true);
            
            const message = `Mestre, peço desculpa pela interrupção. ${data.title}. ${data.content}`;
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
    
    // Ocultar em páginas de autenticação para não poluir a UI de entrada
    const authPages = ['/entrar', '/cadastro', '/forgot-password', '/reset-password'];
    if (authPages.some(page => pathname?.startsWith(page))) return null;

    // Agora o Brain é visível em todo o lado (público e dashboard)

    return (
        <>
            <style>{`
                @keyframes spin-gemini-border {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .gemini-ai-wrapper {
                    position: relative;
                    flex: 1;
                    border-radius: 50px;
                    padding: 2px;
                    display: flex;
                    overflow: hidden;
                    background: #111;
                    width: 100%;
                }
                .gemini-ai-wrapper::before {
                    content: "";
                    position: absolute;
                    top: -150%; right: -50%; bottom: -150%; left: -50%;
                    background: conic-gradient(from 0deg, transparent 0%, transparent 40%, #4285f4 60%, #ea4335 70%, #fbbc05 80%, #34a853 90%, transparent 100%);
                    animation: spin-gemini-border 3s linear infinite;
                    z-index: 0;
                }
                .gemini-ai-input {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    background: rgba(15,15,15,0.9);
                    border: none;
                    border-radius: 48px;
                    padding: 10px 15px;
                    color: #fff;
                    font-size: 0.8rem;
                    outline: none;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                }
                .gemini-ai-input::placeholder {
                    color: #9aa0a6;
                }
            `}</style>
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
                            drag={!isMobile}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: 0.1, perspective: 2000, rotateX: -25, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0, rotateX: 25, filter: 'blur(20px)' }}
                            transition={{ 
                                type: "spring", 
                                damping: 22, 
                                stiffness: 100,
                                mass: 0.8,
                                filter: { duration: 0.4 }
                            }}
                            style={{ 
                                position: 'relative', 
                                width: isMobile ? '98vw' : '820px', 
                                height: isMobile ? '53vw' : '440px', 
                                cursor: isMobile ? 'default' : 'grab', 
                                filter: isAlert ? 'drop-shadow(0 0 40px rgba(239,68,68,0.4))' : 'drop-shadow(0 0 30px rgba(234,179,8,0.2))', 
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileDrag={isMobile ? {} : { cursor: 'grabbing', scale: 1.01 }}
                        >
                            {/* SVG Monitor Frame - Same for both desktop & mobile */}
                            <svg width="100%" height="100%" viewBox="0 0 820 440" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
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
                                    <filter id="glowSpeaking">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                <ellipse cx="410" cy="425" rx="180" ry="15" fill="rgba(0,0,0,0.5)" />
                                <path 
                                    d="M 0,0 Q 410,24 820,0 L 820,340 Q 410,316 0,340 Z" 
                                    fill="none" 
                                    stroke={isSpeaking ? "#eab308" : isAlert ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.08)"} 
                                    strokeWidth={isSpeaking ? "2" : "4"} 
                                    filter={isSpeaking ? "url(#glowSpeaking)" : "blur(4px)"} 
                                    style={{ transition: 'all 0.5s ease' }}
                                />
                                <path d="M 0,0 Q 410,24 820,0 L 820,340 Q 410,316 0,340 Z" fill="url(#bezelGrad)" stroke="#111" strokeWidth="1" />
                                
                                {/* Background Neural Grid */}
                                <g opacity="0.05">
                                    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#eab308" strokeWidth="0.5" />
                                        <circle cx="0" cy="0" r="1" fill="#eab308" />
                                    </pattern>
                                    <rect x="12" y="14" width="796" height="312" fill="url(#gridPattern)" />
                                </g>

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

                            {/* Content Overlays - Adjusted offsets for mobile to fit within curve */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                style={{ 
                                    position: 'absolute', 
                                    top: isMobile ? '5.5%' : '48px', 
                                    left: isMobile ? '6.5%' : '55px', 
                                    right: isMobile ? '6.5%' : '55px', 
                                    bottom: isMobile ? '23%' : '110px', 
                                    zIndex: 5, 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? '5px' : '25px', 
                                    padding: isMobile ? '10px' : '15px 20px', 
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Left Column: Brain + Status */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'row' : 'column', 
                                    alignItems: 'center', 
                                    justifyContent: isMobile ? 'space-between' : 'center', 
                                    gap: '10px', 
                                    minWidth: isMobile ? '0' : '180px',
                                    padding: isMobile ? '5px 10px' : '0',
                                    background: isMobile ? 'rgba(255,255,255,0.03)' : 'none',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ transform: isMobile ? 'scale(0.5)' : 'scale(0.75)', transformOrigin: 'center center' }}>
                                        <CerberusVisual isListening={isListening} isThinking={isThinking} isAlert={isAlert} isSpeaking={isSpeaking} />
                                    </div>
                                    <div style={{ textAlign: isMobile ? 'left' : 'center', flex: isMobile ? 1 : 'none', marginLeft: isMobile ? '10px' : '0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        <h3 style={{ fontWeight: 'bold', color: isAlert ? '#ef4444' : isThinking ? '#38bdf8' : '#fff', fontSize: isMobile ? '0.8rem' : '0.9rem', textTransform: isThinking ? 'uppercase' : 'none', letterSpacing: '1px', margin: 0 }}>
                                            {isThinking ? 'Processando...' : isListening ? 'Escutando...' : 'Brain'}
                                        </h3>
                                        <p style={{ color: '#9ca3af', fontSize: '9px', margin: '4px 0 0', lineHeight: '1.4' }}>
                                            {isAlert ? 'Alerta!' : isThinking ? 'Analisando...' : 'Inscreva-se'}
                                        </p>
                                        {!isMobile && <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.03)' }}><VoiceVisualizer /></div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {isSpeaking && (
                                            <button onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); speak("Entendido. Silenciando."); }} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                                <Square size={14} fill="currentColor" />
                                            </button>
                                        )}
                                        <button onClick={() => { playSystemSound('close'); speak("Desativando sistemas neurais."); setTimeout(() => setIsHibernated(true), 1500); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Hibernate">
                                            <Power size={18} />
                                        </button>
                                        <button onClick={() => { setChatHistory([]); speak("Memória de chat limpa. Estou pronto para uma nova orquestração, Mestre."); triggerAlert("Histórico de chat reiniciado.", "success"); }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Limpar Chat">
                                            <Square size={16} />
                                        </button>
                                        <button onClick={() => { playSystemSound('close'); speak("Desligando o Sistema."); setIsVisible(false); }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {!isMobile && <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />}

                                {/* Right Column: Chat/Interaction */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(234, 179, 8, 0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(234, 179, 8, 0.15)', marginBottom: '2px', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%', boxShadow: '0 0 8px #eab308' }} />
                                            <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#eab308', letterSpacing: '0.5px' }}>{isMobile ? 'MODO MOBILE' : 'BETA / EM DESENVOLVIMENTO'}</span>
                                        </div>
                                        <span style={{ fontSize: '8px', color: '#6b7280' }}>v2.4.8</span>
                                    </div>

                                    {currentTranscript && isListening && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#fef08a', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(234, 179, 8, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{"\""}{currentTranscript}...{"\""}</motion.div>
                                    )}

                                    {lastCommand && !isListening && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1, borderColor: isThinking ? ['rgba(56,189,248,0.2)','rgba(56,189,248,0.8)','rgba(56,189,248,0.2)'] : 'rgba(234,179,8,0.2)', boxShadow: isThinking ? ['0 0 0px rgba(56,189,248,0)','0 0 15px rgba(56,189,248,0.3)','0 0 0px rgba(56,189,248,0)'] : 'none' }} transition={isThinking ? { duration: 1.5, repeat: Infinity } : {}} style={{ background: isThinking ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.1)', border: '1px solid', padding: '6px 15px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flexShrink: 0 }}><Terminal size={12} style={{ color: isThinking ? '#38bdf8' : '#eab308', minWidth: '12px' }} /><span style={{ color: isThinking ? '#38bdf8' : '#eab308', fontSize: '0.8rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastCommand}</span></motion.div>
                                    )}

                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#d1d5db', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', paddingRight: '10px', minHeight: '0' }}>
                                        {chatHistory.length > 0 ? chatHistory.map((msg, idx) => {
                                            // System inline message
                                            if (msg.text.startsWith('__SYSTEM__')) {
                                                const parts = msg.text.split('__');
                                                const sysType = parts[2] as 'info' | 'error' | 'success';
                                                const sysMsg = parts.slice(3).join('__');
                                                const color = sysType === 'error' ? '#f87171' : sysType === 'success' ? '#4ade80' : '#94a3b8';
                                                const icon = sysType === 'error' ? '⚠' : sysType === 'success' ? '✓' : 'ℹ';
                                                
                                                const handleCopyError = () => {
                                                    navigator.clipboard.writeText(sysMsg);
                                                    setCopiedIndex(idx);
                                                    setTimeout(() => setCopiedIndex(null), 2000);
                                                };

                                                return (
                                                    <div key={idx} style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px', color, fontSize: '0.78rem', fontFamily: 'monospace', opacity: 0.75, padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, width: '100%', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                                            <span style={{ flexShrink: 0 }}>{icon}</span>
                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sysMsg}</span>
                                                        </div>
                                                        {sysType === 'error' && (
                                                            <button 
                                                                onClick={handleCopyError}
                                                                style={{ 
                                                                    background: 'rgba(255,255,255,0.05)', 
                                                                    border: 'none', 
                                                                    borderRadius: '4px', 
                                                                    padding: '4px', 
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: color,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                title="Copiar erro"
                                                            >
                                                                {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return (
                                            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: `1px solid ${msg.role === 'user' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`, padding: '12px 18px', borderRadius: '12px', maxWidth: '95%', wordBreak: 'break-word', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                                                {msg.role === 'ai' ? (
                                                    <div style={{ fontSize: '0.95rem', color: '#f8fafc', lineHeight: '1.6' }}>
                                                        <TypewriterText text={msg.text} />
                                                    </div>
                                                ) : <span style={{ color: '#fef08a' }}>{msg.text}</span>}
                                            </div>
                                            );
                                        }) : (
                                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, gap: '8px' }}><div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}><p style={{ margin: 0, fontSize: '11px' }}>Sistemas Prontos.</p><p style={{ margin: 0, fontSize: '9px', marginTop: '4px' }}>Diga {"\""}Cérbero{"\""} ou clique no botão para testar.</p></div></div>
                                        )}
                                        {isThinking && (
                                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '15px 18px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%' }} />
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%' }} />
                                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%' }} />
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />


                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '95%', margin: '0 auto', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                            <div className="gemini-ai-wrapper">
                                                <input 
                                                    type="text" 
                                                    className="gemini-ai-input"
                                                    value={textInput} 
                                                    onChange={(e) => setTextInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && textInput.trim()) {
                                                            handleCommand(textInput.trim());
                                                            setTextInput("");
                                                        }
                                                    }}
                                                    placeholder="Para começar a orquestrar, digite..."
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                disabled={isThinking || !textInput.trim()} 
                                                onClick={() => {
                                                    if (textInput.trim()) {
                                                        handleCommand(textInput.trim());
                                                        setTextInput("");
                                                    }
                                                }}
                                                style={{
                                                    background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                                    color: '#000',
                                                    border: 'none',
                                                    width: '44px',
                                                    height: '44px',
                                                    minWidth: '44px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: (!textInput.trim() || isThinking) ? 'not-allowed' : 'pointer',
                                                    opacity: (!textInput.trim() || isThinking) ? 0.3 : 1,
                                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    boxShadow: '0 4px 10px rgba(234, 179, 8, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
                                                    zIndex: 10
                                                }}
                                            >
                                                <Terminal size={18} />
                                            </button>
                                        </div>
                                        
                                        {hasSupport && (
                                            <motion.button 
                                                whileHover={{ scale: 1.02, boxShadow: isSpeaking ? '0 8px 25px rgba(249, 115, 22, 0.4)' : isListening ? '0 8px 25px rgba(239, 68, 68, 0.4)' : '0 8px 25px rgba(234, 179, 8, 0.4)' }} 
                                                whileTap={{ scale: 0.98 }} 
                                                onClick={() => {
                                                    if (isSpeaking) {
                                                        if (currentAudioRef.current) {
                                                            currentAudioRef.current.pause();
                                                            currentAudioRef.current = null;
                                                        }
                                                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                                                        setIsSpeaking(false);
                                                        speak("Entendido. Silenciando.");
                                                    } else {
                                                        speak("Comando de voz ativo.");
                                                        startListening();
                                                    }
                                                }} 
                                                disabled={isListening && !isSpeaking} 
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '8px', 
                                                    borderRadius: '12px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    gap: '10px', 
                                                    border: 'none', 
                                                    background: isSpeaking ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' : isListening ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', 
                                                    color: (isListening || isSpeaking) ? '#fff' : '#000', 
                                                    fontWeight: '900', 
                                                    fontSize: '0.8rem', 
                                                    letterSpacing: '1px', 
                                                    cursor: (isListening && !isSpeaking) ? 'default' : 'pointer', 
                                                    outline: 'none', 
                                                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', 
                                                    boxShadow: isSpeaking ? '0 6px 20px rgba(249, 115, 22, 0.3)' : isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 6px 20px rgba(234, 179, 8, 0.25)' 
                                                }}
                                            >
                                                {isSpeaking ? (
                                                    <><Square size={20} fill="#fff" /><span>PARAR FALA</span></>
                                                ) : isListening ? (
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
                            top: '100px', 
                            right: '25px', 
                            zIndex: 100000,
                            pointerEvents: 'auto'
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(66, 133, 244, 0.4)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { 
                                setIsVisible(true); 
                                playSystemSound('intro');
                                
                                // Tenta obter o nome do utilizador do localStorage
                                let userName = "";
                                try {
                                    const storedUser = localStorage.getItem('user');
                                    if (storedUser) {
                                        const userObj = JSON.parse(storedUser);
                                        userName = userObj.name || "";
                                    }
                                } catch (e) {
                                    console.error("Erro ao ler nome do utilizador:", e);
                                }

                                const namePrefix = userName ? `! ${userName}.` : ", Mestre.";
                                const greeting = `${getTimeGreeting()}${namePrefix} Seja bem-vindo ao Inscreva-se. Como posso ajudar?`;
                                speak(greeting);
                                setChatHistory([{ role: 'ai', text: greeting }]);
                            }}
                            className="gemini-ai-wrapper"
                            style={{
                                position: 'relative',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                padding: '2px',
                                cursor: 'pointer',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#111',
                                border: 'none',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                            }}
                        >
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 2, 
                                background: '#111', 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Command size={24} color="#fff" />
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
