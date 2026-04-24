"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "O que é o Inscreva-se e como funciona?",
            answer: "O Inscreva-se é uma plataforma líder em criação e gestão de eventos. Permitimos que organizadores, mentores e palestrantes criem páginas de eventos, vendam bilhetes online através de múltiplos métodos de pagamento (como Multicaixa Express e M-Pesa) e gerenciem os seus participantes com facilidade."
        },
        {
            question: "A plataforma é gratuita?",
            answer: "Oferecemos um plano gratuito ideal para eventos pequenos ou gratuitos, permitindo que você teste a plataforma sem custos. Para eventos maiores ou que necessitem de funcionalidades premium, oferecemos planos com taxas competitivas por transação."
        },
        {
            question: "Quais são os métodos de pagamento suportados?",
            answer: "Suportamos os métodos mais populares em Angola e Moçambique, incluindo Multicaixa Express (referência), M-Pesa, transferências bancárias manuais e cartões de crédito/débito internacionais (Visa/Mastercard)."
        },
        {
            question: "Como funciona o check-in no dia do evento?",
            answer: "A nossa plataforma gera automaticamente um QR Code único para cada bilhete vendido ou inscrição confirmada. No dia do evento, a sua equipa só precisa apontar a câmara do telemóvel para fazer o check-in de forma instantânea e segura."
        },
        {
            question: "Posso vender cursos em vídeo (Masterclasses)?",
            answer: "Sim! Além de eventos presenciais e ao vivo, o Inscreva-se possui um módulo de 'Aulas' onde pode publicar os seus vídeos, PDFs e materiais complementares, vendendo acesso restrito aos seus alunos."
        }
    ];

    return (
        <section style={{ padding: '80px 20px', background: '#fcfcfc', borderTop: '1px solid #eee' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>
                        Perguntas <span className="gold-text">Frequentes</span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>
                        Tudo o que você precisa saber sobre a nossa plataforma de gestão de eventos.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {faqs.map((faq, index) => (
                        <div key={index} style={{
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #eaeaea',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                        }}>
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '1.05rem',
                                    color: '#333'
                                }}
                            >
                                {faq.question}
                                {openIndex === index ? <ChevronUp size={20} color="#FFD700" /> : <ChevronDown size={20} color="#999" />}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div style={{ padding: '0 20px 20px', color: '#666', lineHeight: 1.6 }}>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
