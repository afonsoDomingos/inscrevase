"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
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
    const [recognition, setRecognition] = useState<IRecognition | null>(null);

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
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'pt-PT'; 

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                onCommand(transcript);
            };

            setRecognition(rec as unknown as IRecognition);
        }
    }, [onCommand]);

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

    return { isListening, startListening, stopListening, hasSupport: !!recognition };
};
