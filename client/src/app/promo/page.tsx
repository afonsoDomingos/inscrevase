"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function PromoPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const promoText = `“Queres organizar eventos de forma simples, profissional e sem dores de cabeça?
Então deixa-me apresentar-te a Inscreva-se.

A Inscreva-se é uma plataforma completa para criação e gestão de eventos — desde mentorias, palestras, masterclasses até lançamentos de livros e muito mais.

Com ela, podes criar o teu evento em poucos minutos, gerir participantes, automatizar toda a comunicação e ainda receber pagamentos tanto a nível nacional como internacional.

Tudo fica centralizado num único lugar — mais organização, mais controlo e muito mais profissionalismo.

Se és mentor, especialista ou empresa e queres escalar os teus eventos sem complicações, a Inscreva-se é a solução ideal para ti.

Experimenta agora e leva os teus eventos para o próximo nível.”`;

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[“”]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'pt-PT';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        
        // Find best voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => (v.lang === 'pt-PT' || v.lang === 'pt_PT') && v.name.includes('Google')) || 
                               voices.find(v => v.lang.startsWith('pt')) || 
                               voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    }, []);

    const startPromo = () => {
        setIsStarted(true);
        speak(promoText);
        
        let i = 0;
        setDisplayedText("");
        const timer = setInterval(() => {
            setDisplayedText(promoText.substring(0, i));
            i++;
            if (i > promoText.length) {
                clearInterval(timer);
            }
        }, 30);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-yellow-500/30">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen">
                <AnimatePresence mode="wait">
                    {!isStarted ? (
                        <motion.div 
                            key="hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            className="text-center max-w-4xl"
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
                            >
                                <Zap size={14} className="text-yellow-500" />
                                <span className="text-xs font-bold tracking-widest uppercase">Inteligência Neural Ativa</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
                                LEVE SEUS EVENTOS AO <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-white to-blue-500">PRÓXIMO NÍVEL</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                                Descubra como a <strong>Inscreva-se</strong> transforma a complexidade em simplicidade através da orquestração neural do Cérbero.
                            </p>

                            <div className="flex flex-col md:row gap-6 justify-center items-center">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(234, 179, 8, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startPromo}
                                    className="group relative px-10 py-5 bg-yellow-500 text-black font-bold rounded-2xl flex items-center gap-3 overflow-hidden transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                    <Play size={20} fill="currentColor" />
                                    <span>OUVIR APRESENTAÇÃO</span>
                                </motion.button>
                                
                                <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">
                                    CONHECER RECURSOS
                                </button>
                            </div>

                            {/* Image Showcase */}
                            <motion.div 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-20 relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                                <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-yellow-500/10">
                                    <Image 
                                        src="/promo-hero.png" 
                                        alt="Inscreva-se Promo" 
                                        width={1200} 
                                        height={675}
                                        className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="presentation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center"
                        >
                            {/* Visualizer Side */}
                            <div className="relative flex items-center justify-center">
                                <motion.div 
                                    animate={{ 
                                        scale: isSpeaking ? [1, 1.05, 1] : 1,
                                        boxShadow: isSpeaking ? ['0 0 20px rgba(234,179,8,0.2)', '0 0 60px rgba(234,179,8,0.4)', '0 0 20px rgba(234,179,8,0.2)'] : '0 0 20px rgba(255,255,255,0.05)'
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
                                    
                                    {/* Abstract AI Visual */}
                                    <div className="flex gap-1 items-end h-32">
                                        {[...Array(15)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ 
                                                    height: isSpeaking ? [10, Math.random() * 80 + 20, 10] : 10,
                                                    opacity: isSpeaking ? 1 : 0.3
                                                }}
                                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                                className="w-2 bg-yellow-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    
                                    <div className="absolute bottom-10 text-center">
                                        <div className="text-[10px] tracking-[0.3em] font-black text-yellow-500/50 uppercase">Brain Orchestrator</div>
                                    </div>
                                </motion.div>
                                
                                {/* Floating Badges */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-4 -right-4 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3"
                                >
                                    <ShieldCheck className="text-green-500" size={24} />
                                    <div>
                                        <div className="text-xs font-bold">100% SEGURO</div>
                                        <div className="text-[10px] text-gray-400">Criptografia de Elite</div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                                    className="absolute -bottom-4 -left-4 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3"
                                >
                                    <Globe className="text-blue-500" size={24} />
                                    <div>
                                        <div className="text-xs font-bold">GLOBAL</div>
                                        <div className="text-[10px] text-gray-400">Múltiplas Moedas</div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Text Side */}
                            <div className="flex flex-col gap-8">
                                <div className="p-8 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500" />
                                    <Volume2 className="text-yellow-500/20 absolute top-8 right-8" size={64} />
                                    
                                    <div className="text-xl md:text-2xl font-medium leading-relaxed text-gray-200 min-h-[300px] whitespace-pre-wrap">
                                        {displayedText}
                                        <motion.span 
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                            className="inline-block w-2 h-6 bg-yellow-500 ml-1 translate-y-1"
                                        />
                                    </div>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: displayedText.length > 100 ? 1 : 0 }}
                                    className="flex justify-end"
                                >
                                    <button 
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="flex items-center gap-2 text-yellow-500 font-bold hover:gap-4 transition-all"
                                    >
                                        COMEÇAR AGORA <ArrowRight size={20} />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer decoration */}
            <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-between items-center z-20 pointer-events-none">
                <div className="text-[10px] tracking-widest text-gray-600 font-bold">POWERED BY MUV EDUCAÇÃO & ENGENHARIA</div>
                <div className="flex gap-4 opacity-30">
                    <div className="w-12 h-1 bg-white/20" />
                    <div className="w-12 h-1 bg-white/20" />
                    <div className="w-12 h-1 bg-yellow-500/40" />
                </div>
            </footer>
        </div>
    );
}
