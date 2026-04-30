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
                setIsListening(true);
                setCurrentTranscript("");
            };

            rec.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error === 'no-speech') {
                    // Ignora silêncio momentâneo se contínuo for true
                } else {
                    setIsListening(false);
                }
            };

            rec.onend = () => {
                // No modo contínuo, só paramos manualmente ou em erro fatal
                setIsListening(false);
            };

            rec.onresult = (event: SpeechRecognitionEvent) => {
                let interim = '';
                let finalStr = '';
                
                const startIndex = event.resultIndex;
                
                for (let i = startIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalStr = result[0].transcript;
                        // No modo contínuo, paramos após o primeiro comando finalizado para processar
                        rec.stop();
                    } else {
                        interim += result[0].transcript;
                    }
                }
                
                if (finalStr) {
                    setCurrentTranscript(finalStr);
                    if (onCommandRef.current) {
                        onCommandRef.current(finalStr.toLowerCase());
                    }
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
