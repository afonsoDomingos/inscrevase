"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command, Power, Square, Copy, Check, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';
import { aiService } from '@/lib/aiService';
import { useSocket } from '@/context/SocketContext';

// Componente para Efeito de Digitação
const TypewriterText = ({ text, speed = 8 }: { text: string, speed?: number }) => {
    const router = useRouter();
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
                a: ({node, href, children, ...props}) => {
                    const isExternal = href?.startsWith('http');
                    return (
                        <a 
                            style={{ 
                                color: '#facc15', 
                                textDecoration: 'underline', 
                                textUnderlineOffset: '3px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'color 0.2s'
                            }}
                            href={isExternal ? href : undefined}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            onMouseDown={(e) => e.stopPropagation()} // Impede drag de roubar o clique
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isExternal && href) {
                                    window.open(href, '_blank', 'noopener,noreferrer');
                                } else if (href) {
                                    router.push(href);
                                }
                            }}
                            {...props}
                        >
                            {children}
                        </a>
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
    const [isMaximized, setIsMaximized] = useState(false);
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
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isShuttingDown, setIsShuttingDown] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const triggerAlert = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
        if (type === 'error') setIsAlert(true);
        
        // Inject as inline system message in chat instead of floating overlay
        setChatHistory(prev => [...prev, { role: 'system' as 'ai', text: `__SYSTEM__${type}__${message}` }]);
        
        if (type === 'error') {
            setTimeout(() => setIsAlert(false), 4000);
        }
    }, []);

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

        // Cancelar qualquer fala pendente IMEDIATAMENTE
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-PT';
        utterance.rate = 1.05; // Ligeiramente mais rápido para parecer mais "vivo"
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            console.log("%c🔊 [VOICE] Usando síntese local (Browser)...", "color: #38bdf8;");
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = (e) => {
            console.error("Erro na síntese de voz:", e);
            setIsSpeaking(false);
            if (onEndCallback) onEndCallback();
        };

        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        const ptBRVoices = availableVoices.filter(v => v.lang.startsWith('pt-BR'));
        const ptPTVoices = availableVoices.filter(v => v.lang.startsWith('pt-PT'));
        
        const preferredVoice = (preferredVoiceName && availableVoices.find(v => v.name === preferredVoiceName)) ||
                               ptBRVoices.find(v => v.name.toLowerCase().includes('google')) ||
                               ptBRVoices.find(v => v.name.toLowerCase().includes('natural')) ||
                               ptPTVoices.find(v => v.name.toLowerCase().includes('natural')) ||
                               ptBRVoices[0] ||
                               ptPTVoices[0] || 
                               availableVoices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        // Falar imediatamente sem delay artificial
        window.speechSynthesis.speak(utterance);
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

            // null = provider premium não configurado → fallback silencioso
            if (!audioBlob) {
                fallbackToBrowserTTS(cleanText, onEndCallback);
                return;
            }

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
    }, [voiceMode, fallbackToBrowserTTS, preferredVoiceName]);

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

        // Comando Especial: Câmbio do Dia (Painel Automático)
        if (/(cambio|câmbio|mercado global|taxas de cambio|conversor|taxas de câmbio|cambio do dia)/.test(lowerTranscript)) {
            window.dispatchEvent(new Event('brain-action-cambio'));
            const msg = "A abrir o Mercado Global de Câmbios em tempo real para si.";
            setChatHistory(prev => [...prev, { role: 'ai', text: msg }]);
            speak(msg);
            setIsThinking(false);
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
        if (lowerTranscript.includes('quem te criou') || lowerTranscript.includes('quem é o teu criador') || lowerTranscript.includes('quem te fez') || lowerTranscript.includes('afonso domingos')) {
            const creatorInfo = "Fui concebido e orquestrado por Afonso Domingos, o Fundador da Inscreva-se. A redirecioná-lo agora mesmo para o perfil do meu Mestre Supremo.";
            setChatHistory(prev => [...prev, { role: 'ai', text: creatorInfo + "\n\nA abrir: [Perfil do Criador](/equipe/afonso-domingos)" }]);
            speak(creatorInfo);
            setIsThinking(false);
            setTimeout(() => { window.location.href = '/equipe/afonso-domingos'; }, 2000);
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

        // Helpers para Scroll Universal (Poder Máximo)
        const performSuperScroll = (amount: number) => {
            try {
                // 1. Scroll Nativo da Janela
                window.scrollBy({ top: amount, behavior: 'smooth' });
                
                // 2. Scroll de Documento e Body
                if (document.documentElement) document.documentElement.scrollBy({ top: amount, behavior: 'smooth' });
                if (document.body) document.body.scrollBy({ top: amount, behavior: 'smooth' });

                // 3. O Dashboard e outras páginas podem ter scroll preso num contentor main
                const mainEl = document.querySelector('main');
                if (mainEl) mainEl.scrollBy({ top: amount, behavior: 'smooth' });
                
                // 4. Algoritmo de Detecção de Scroller Ativo
                // Procura o elemento com a maior altura de conteúdo (scrollHeight) e que seja maior que a tela
                const allElements = document.querySelectorAll('div, section, main, article');
                let bestScroller: HTMLElement | null = null;
                let maxScroll = 0;

                allElements.forEach(el => {
                    const htmlEl = el as HTMLElement;
                    const style = window.getComputedStyle(htmlEl);
                    const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto';
                    
                    if (isScrollable && htmlEl.scrollHeight > maxScroll) {
                        maxScroll = htmlEl.scrollHeight;
                        bestScroller = htmlEl;
                    }
                });

                if (bestScroller) {
                    (bestScroller as HTMLElement).scrollBy({ top: amount, behavior: 'smooth' });
                }
            } catch (error) {
                console.error("Falha no SuperScroll Detalhado:", error);
            }
        };

        // Comando Especial: Controle Físico da Tela (Scroll)
        const wantsToScrollUp = /(subir|cima|sobe|topo|scroll.*cima|scrool.*cima|srool.*cima|rola.*cima|rol.*cima)/.test(lowerTranscript);
        const wantsToScrollDown = /(descer|baixo|desce|fundo|scroll|scrool|srool|scrol|escrool|rolar|rola\b|rol\b)/.test(lowerTranscript);

        if (wantsToScrollUp || wantsToScrollDown) {
            // Privilegia o subir se a palavra cima estiver presente explícitamente e a direção descer não estiver.
            const isUp = wantsToScrollUp && !/(descer|baixo|fundo)/.test(lowerTranscript);
            performSuperScroll(isUp ? -window.innerHeight * 0.8 : window.innerHeight * 0.8);
            
            const msg = isUp ? "A subir a página." : "A descer a página, Mestre.";
            setChatHistory(prev => [...prev, { role: 'ai', text: msg }]);
            speak(msg);
            setIsThinking(false);
            return;
        }

        // Mapeamento Abrangente de Rotas (Atalhos Rápidos)
        const routes: Record<string, { path: string, response: string, keywords: string[] }> = {
            '/dashboard/mentor?tab=overview': { path: '/dashboard/mentor?tab=overview', response: 'Entendido, Mestre. A carregar a sua visão geral.', keywords: ['visão geral', 'resumo', 'dashboard mentor', 'painel mentor'] },
            '/dashboard/mentor?tab=forms': { path: '/dashboard/mentor?tab=forms', response: 'A abrir os seus eventos e formulários.', keywords: ['meus eventos', 'meus formulários', 'gerir eventos'] },
            '/dashboard/mentor?tab=submissions': { path: '/dashboard/mentor?tab=submissions', response: 'A consultar a lista de participantes.', keywords: ['ver inscrições', 'ver participantes', 'lista de participantes', 'lista de inscritos'] },
            '/dashboard/admin?tab=overview': { path: '/dashboard/admin?tab=overview', response: 'A aceder ao centro de comando administrativo.', keywords: ['painel admin', 'dashboard admin', 'estatísticas globais'] },
            '/dashboard/admin?tab=users': { path: '/dashboard/admin?tab=users', response: 'A carregar a base de utilizadores da plataforma.', keywords: ['gestão de utilizadores', 'ver utilizadores', 'lista de utilizadores', 'lista de pessoas'] },
            '/dashboard/perfil': { path: '/dashboard/perfil', response: 'A abrir o seu perfil profissional.', keywords: ['meu perfil', 'perfil profissional'] },
            '/explorar': { path: '/explorar', response: 'A carregar a página de exploração de eventos.', keywords: ['explorar eventos', 'ver eventos públicos', 'página de eventos'] },
            '/': { path: '/', response: 'A retornar à página inicial. Até breve, Mestre.', keywords: ['ir para home', 'sair da dashboard', 'página inicial', 'abrir site principal'] }
        };

        let foundEntry = null;
        // Só tenta os atalhos diretos se a frase for curta (comando direto) ou se for muito explícita.
        // Se o utilizador ditar um testamento (> 60 caracteres), passamos logo para a IA Neural.
        if (lowerTranscript.length < 60) {
            for (const entry of Object.values(routes)) {
                if (entry.keywords.some(keyword => lowerTranscript.includes(keyword))) {
                    foundEntry = entry;
                    break;
                }
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

                // Action Trigger Logic (Multiple Actions Support)
                const actionMatches = [...reply.matchAll(/\[\[ACTION:(.*?)\]\]/g)];
                if (actionMatches.length > 0) {
                    reply = reply.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
                    
                    // Dispatch the specific action events sequentially
                    setTimeout(async () => {
                        for (const match of actionMatches) {
                            const actionName = match[1].trim();
                            if (actionName.startsWith('create_event_type:')) {
                                const templateType = actionName.split(':')[1];
                                window.dispatchEvent(new Event('open-create-event-modal'));
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('brain-select-template', { detail: { type: templateType } }));
                                }, 500); // Give modal time to open
                                triggerAlert(`A iniciar modo de criação para: ${templateType}`, 'success');
                            } else if (actionName.startsWith('set_event_step:')) {
                                const stepStr = actionName.split(':')[1];
                                window.dispatchEvent(new CustomEvent('brain-change-step', { detail: { step: stepStr } }));
                                triggerAlert(`A navegar para a etapa: ${stepStr}`, 'success');
                            } else if (actionName.startsWith('fill_field:')) {
                                // Extract field and value (value might contain colons, so we slice)
                                const parts = actionName.split(':');
                                const field = parts[1];
                                const value = parts.slice(2).join(':');
                                window.dispatchEvent(new CustomEvent('brain-fill-field', { detail: { field, value } }));
                                triggerAlert(`A preencher o campo: ${field}`, 'success');
                            } else {
                                window.dispatchEvent(new Event(`brain-action-${actionName}`));
                                triggerAlert(`A executar ação: ${actionName}`, 'success');
                            }
                            
                            // Pausa dramática/UX de 3.5 segundos entre cada ação para o utilizador ver o que foi feito
                            await new Promise(resolve => setTimeout(resolve, 3500));
                        }
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

    const { isListening, currentTranscript, startListening, stopListening, hasSupport } = useSpeechRecognition((cmd) => {
        handleCommand(cmd);
        setTextInput("");
    });

    // Sincronizar Transcrição com Input em Tempo Real
    useEffect(() => {
        if (isListening && currentTranscript) {
            setTextInput(currentTranscript);
        }
    }, [currentTranscript, isListening]);

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

        // Truque de Mestre: "Acordar" o motor de áudio com uma fala vazia
        // Isso resolve o lag que acontece no primeiro uso em muitos computadores.
        setTimeout(() => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const wakeUp = new SpeechSynthesisUtterance("");
                window.speechSynthesis.speak(wakeUp);
            }
        }, 2000);
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
                .listening-pulse {
                    animation: listening-border-pulse 1.5s infinite;
                }
                @keyframes listening-border-pulse {
                    0% { border-color: rgba(239,68,68,0.2); box-shadow: 0 0 0px rgba(239,68,68,0); }
                    50% { border-color: rgba(239,68,68,1); box-shadow: 0 0 15px rgba(239,68,68,0.4); }
                    100% { border-color: rgba(239,68,68,0.2); box-shadow: 0 0 0px rgba(239,68,68,0); }
                }
                
                /* Custom Tooltips */
                [data-tooltip] {
                    position: relative;
                }
                [data-tooltip]::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%) scale(0.8);
                    padding: 5px 10px;
                    background: rgba(0, 0, 0, 0.9);
                    color: #fff;
                    font-size: 10px;
                    white-space: nowrap;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    pointer-events: none;
                    opacity: 0;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 1000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                }
                [data-tooltip]:hover::after {
                    opacity: 1;
                    transform: translateX(-50%) scale(1);
                    bottom: 140%;
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
                                width: isMaximized 
                                    ? 'min(95vw, calc(90vh * 1.86))' 
                                    : (isMobile ? '98vw' : '820px'), 
                                height: isMaximized 
                                    ? 'min(90vh, calc(95vw / 1.86))' 
                                    : (isMobile ? '53vw' : '440px'), 
                                cursor: isMobile || isMaximized ? 'default' : 'grab', 
                                filter: isAlert ? 'drop-shadow(0 0 40px rgba(239,68,68,0.4))' : 'drop-shadow(0 0 30px rgba(234,179,8,0.2))', 
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'width 0.4s ease, height 0.4s ease'
                            }}
                            whileDrag={isMobile || isMaximized ? {} : { cursor: 'grabbing', scale: 1.01 }}
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
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        {isThinking && (
                                            <button 
                                                onClick={() => { 
                                                    setIsThinking(false); 
                                                    speak("Processamento interrompido pelo utilizador."); 
                                                    triggerAlert("Interrupção manual detectada.", "info");
                                                }} 
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                                title="Parar Processamento"
                                            >
                                                <Square size={18} fill="#ef4444" />
                                            </button>
                                        )}
                                        {isSpeaking && (
                                            <button 
                                                onClick={() => { 
                                                    window.speechSynthesis?.cancel(); 
                                                    if (currentAudioRef.current) {
                                                        currentAudioRef.current.pause();
                                                        currentAudioRef.current = null;
                                                    }
                                                    setIsSpeaking(false); 
                                                    speak("Entendido. Silenciando."); 
                                                }} 
                                                style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                                title="Parar Fala"
                                            >
                                                <Square size={14} fill="currentColor" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => { 
                                                setIsResetting(true);
                                                setChatHistory([]); 
                                                setLastCommand("");
                                                setTextInput("");
                                                if (window.speechSynthesis) window.speechSynthesis.cancel();
                                                speak("Sistemas reiniciados. Memória limpa, Mestre."); 
                                                triggerAlert("Monitor Reiniciado", "success"); 
                                                setTimeout(() => setIsResetting(false), 1500);
                                            }} 
                                            style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} 
                                            data-tooltip="Reiniciar Sistemas"
                                        >
                                            <RotateCw size={18} className={isResetting ? 'animate-spin' : ''} />
                                        </button>
                                        <button 
                                            onClick={() => setIsMaximized(!isMaximized)} 
                                            style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} 
                                            data-tooltip={isMaximized ? "Minimizar Ecrã" : "Modo Cinema"}
                                        >
                                            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setIsShuttingDown(true);
                                                playSystemSound('close'); 
                                                speak("Desativando sistemas neurais. Até logo, Mestre."); 
                                                setTimeout(() => {
                                                    setIsHibernated(true);
                                                    setIsShuttingDown(false);
                                                }, 2000); 
                                            }} 
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} 
                                            data-tooltip="Hibernar Sistema"
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setChatHistory([]); 
                                                speak("Memória de chat limpa. Estou pronto para uma nova orquestração, Mestre."); 
                                                triggerAlert("Histórico de chat reiniciado.", "success"); 
                                            }} 
                                            style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} 
                                            data-tooltip="Limpar Histórico"
                                        >
                                            <Square size={16} />
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setIsDisconnecting(true);
                                                playSystemSound('close'); 
                                                speak("Encerrando conexão neural."); 
                                                setTimeout(() => {
                                                    setIsVisible(false);
                                                    setIsDisconnecting(false);
                                                }, 1500);
                                            }} 
                                            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                            data-tooltip="Encerrar Sessão"
                                        >
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

                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#d1d5db', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', paddingRight: '10px', minHeight: '0', position: 'relative' }}>
                                        {/* Monitor Screen Overlay for effects */}
                                        <AnimatePresence>
                                            {(isResetting || isShuttingDown || isDisconnecting) && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{ 
                                                        position: 'absolute', 
                                                        inset: 0, 
                                                        background: '#000', 
                                                        zIndex: 100, 
                                                        pointerEvents: 'none',
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        overflow: 'hidden',
                                                        padding: '10px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '10px',
                                                        color: isDisconnecting ? '#38bdf8' : (isShuttingDown ? '#ef4444' : '#eab308'),
                                                        lineHeight: '1',
                                                        justifyContent: 'center'
                                                    }} 
                                                >
                                                    {[...Array(500)].map((_, i) => (
                                                        <motion.span 
                                                            key={i}
                                                            animate={{ 
                                                                opacity: [0, 1, 0],
                                                                color: isDisconnecting ? ['#38bdf8', '#fff', '#0369a1'] : (isShuttingDown ? ['#ef4444', '#fff', '#7f1d1d'] : ['#eab308', '#fff', '#ca8a04'])
                                                            }}
                                                            transition={{ 
                                                                duration: 0.2, 
                                                                repeat: Infinity, 
                                                                delay: Math.random() * 0.4 
                                                            }}
                                                        >
                                                            {Math.round(Math.random())}
                                                        </motion.span>
                                                    ))}
                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#000', padding: '10px 20px', border: `1px solid ${isDisconnecting ? '#38bdf8' : (isShuttingDown ? '#ef4444' : '#eab308')}`, color: isDisconnecting ? '#38bdf8' : (isShuttingDown ? '#ef4444' : '#eab308'), fontWeight: 'bold', letterSpacing: '2px', boxShadow: `0 0 20px ${isDisconnecting ? 'rgba(56, 189, 248, 0.4)' : (isShuttingDown ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.4)')}` }}>
                                                        {isDisconnecting ? 'DISCONNECTING...' : (isShuttingDown ? 'SHUTTING DOWN...' : 'REBOOTING SYSTEM...')}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                            <div className={`gemini-ai-wrapper ${isListening ? 'listening-pulse' : ''}`} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                paddingRight: '8px',
                                                border: isListening ? '1px solid #ef4444' : '1px solid transparent',
                                                boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}>
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
                                                    placeholder={isListening ? "Cérbero está a ouvir... fale agora" : "Diga ou digite o seu comando..."}
                                                    style={{ flex: 1, color: isListening ? '#ef4444' : '#fff' }}
                                                />
                                                {hasSupport && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isListening) {
                                                                stopListening();
                                                                if (textInput.trim()) {
                                                                    handleCommand(textInput.trim());
                                                                    setTextInput("");
                                                                }
                                                            } else {
                                                                playSystemSound('intro');
                                                                // Pequeno atraso para o som do sistema não ser capturado pelo microfone
                                                                setTimeout(() => startListening(), 300);
                                                            }
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: isListening ? '#ef4444' : '#94a3b8',
                                                            padding: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        data-tooltip={isListening ? "Parar Escuta" : "Clica para Iniciar"}
                                                    >
                                                        {isListening ? (
                                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                                {[1,2,3].map(i => <motion.div key={i} animate={{ height: [4, 12, 4], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} style={{ width: '2px', background: '#ef4444', borderRadius: '9999px' }} />)}
                                                            </div>
                                                        ) : <Mic size={18} />}
                                                    </button>
                                                )}
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
                                                    width: '40px',
                                                    height: '40px',
                                                    minWidth: '40px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: (!textInput.trim() || isThinking) ? 'not-allowed' : 'pointer',
                                                    opacity: (!textInput.trim() || isThinking) ? 0.3 : 1,
                                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    boxShadow: '0 4px 10px rgba(234, 179, 8, 0.3)',
                                                    zIndex: 10
                                                }}
                                                data-tooltip="Enviar Comando"
                                            >
                                                <Terminal size={18} />
                                            </button>
                                        </div>
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
