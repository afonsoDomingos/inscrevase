"use client";

import { motion } from 'framer-motion';
import { Shield, Target, Zap } from 'lucide-react';

export default function InstitutionalSection() {
    return (
        <section style={{ padding: '80px 20px', background: '#fff' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', fontFamily: 'var(--font-playfair)' }}>
                        Nossa <span className="gold-text">Missão Institucional</span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                        O Inscreva-se nasceu para democratizar o acesso à gestão profissional de eventos na lusofonia. Somos a ponte tecnológica que conecta criadores de conteúdo, mentores e organizadores ao seu público.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {[
                        {
                            icon: <Target size={40} color="#FFD700" />,
                            title: "Visão",
                            text: "Ser a maior e mais confiável plataforma de tickets e gestão de conhecimento online em África, impulsionando a transformação digital de milhares de empreendedores."
                        },
                        {
                            icon: <Shield size={40} color="#FFD700" />,
                            title: "Segurança e Conformidade",
                            text: "Priorizamos a segurança dos seus dados e dos seus clientes. Com infraestrutura robusta, garantimos pagamentos seguros e conformidade com as melhores práticas de privacidade internacionais."
                        },
                        {
                            icon: <Zap size={40} color="#FFD700" />,
                            title: "Inovação Contínua",
                            text: "Não somos apenas uma bilheteira. Somos um ecossistema. Desde automação de marketing até à emissão de certificados, desenvolvemos tecnologia de ponta para que você foque apenas no seu evento."
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -10 }}
                            style={{
                                padding: '40px 30px',
                                background: '#fcfcfc',
                                borderRadius: '20px',
                                border: '1px solid #f0f0f0',
                                textAlign: 'center',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(255,215,0,0.1)', padding: '20px', borderRadius: '50%' }}>
                                    {item.icon}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '15px', color: '#1a1a1a' }}>{item.title}</h3>
                            <p style={{ color: '#666', lineHeight: 1.6 }}>{item.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
