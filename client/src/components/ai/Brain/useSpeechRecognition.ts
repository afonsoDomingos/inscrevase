"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface IRecognition {
    start: () => void;
    stop: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onend: () => void;
    onerror: (event: { error: string }) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
}

export const useSpeechRecognition = (onCommand: (command: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [recognition, setRecognition] = useState<IRecognition | null>(null);

    const onCommandRef = useRef(onCommand);
    
    useEffect(() => {
        onCommandRef.current = onCommand;
    }, [onCommand]);

    useEffect(() => {
        interface SpeechRecognitionInstance {
            continuous: boolean;
            interimResults: boolean;
            lang: string;
            onstart: () => void;
            onend: () => void;
            onerror: (event: { error: string }) => void;
            onresult: (event: SpeechRecognitionEvent) => void;
            start: () => void;
            stop: () => void;
        }

        type WindowWithSpeech = Window & typeof globalThis & {
            SpeechRecognition?: new () => SpeechRecognitionInstance;
            webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
        };

        const win = window as unknown as WindowWithSpeech;
        const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true; // Mantém a escuta ativa mesmo com pausas
            rec.interimResults = true;
            rec.lang = 'pt-PT'; 

            rec.onstart = () => {
                console.log("%c🎙️ [MIC] Reconhecimento iniciado. Escutando...", "color: #ef4444; font-weight: bold;");
                setIsListening(true);
                setCurrentTranscript("");
            };

            rec.onerror = (event: { error: string }) => {
                console.error("%c❌ [MIC] Erro no reconhecimento:", "color: #ef4444;", event.error);
                if (event.error === 'no-speech') {
                    // Ignora silêncio momentâneo se contínuo for true
                } else {
                    setIsListening(false);
                }
            };

            rec.onend = () => {
                console.log("%c💤 [MIC] Reconhecimento encerrado.", "color: #94a3b8;");
                setIsListening(false);
            };

            rec.onresult = (event: SpeechRecognitionEvent) => {
                let interim = '';
                let finalStr = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalStr += result[0].transcript;
                    } else {
                        interim += result[0].transcript;
                    }
                }
                
                if (finalStr) {
                    setCurrentTranscript(finalStr);
                    // Disparar o comando automaticamente quando terminar de falar
                    if (onCommandRef.current) {
                        onCommandRef.current(finalStr);
                    }
                    rec.stop();
                } else {
                    setCurrentTranscript(interim);
                }
            };

            setRecognition(rec as unknown as IRecognition);
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Speech recognition already started", e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return { isListening, currentTranscript, startListening, stopListening, hasSupport: !!recognition };
};
