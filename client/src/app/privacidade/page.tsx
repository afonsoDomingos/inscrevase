"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <main style={{ background: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Header Section */}
            <div style={{ background: '#000', color: '#fff', padding: '120px 20px 80px', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <Shield size={60} color="#FFD700" style={{ marginBottom: '20px' }} />
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '20px', fontFamily: 'var(--font-playfair, serif)' }}>
                        Política de <span style={{ color: '#FFD700' }}>Privacidade</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                        Na Inscreva-se, a sua privacidade é a nossa prioridade. Conheça como protegemos os seus dados.
                    </p>
                </motion.div>
            </div>

            {/* Content Section */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px', color: '#334155', lineHeight: '1.8' }}>
                <div style={{ display: 'grid', gap: '60px' }}>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <FileText color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Introdução</h2>
                        </div>
                        <p>
                            A Inscreva-se ("nós", "plataforma") está empenhada em proteger a privacidade dos seus utilizadores.
                            Esta Política de Privacidade explica como recolhemos, utilizamos e protegemos as informações quando utiliza
                            o nosso site e serviços. Ao utilizar a nossa plataforma, concorda com as práticas descritas nesta política.
                        </p>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Eye color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Recolha de Informação</h2>
                        </div>
                        <p>Recolhemos informações de diversas formas, incluindo:</p>
                        <ul>
                            <li><strong>Informações fornecidas por si:</strong> Nome, e-mail e dados de contacto ao registar-se como mentor ou participante.</li>
                            <li><strong>Dados de Utilização:</strong> Informações sobre como utiliza o site, incluindo o seu endereço IP, tipo de navegador e páginas visitadas.</li>
                            <li><strong>Cookies:</strong> Utilizamos cookies para melhorar a experiência do utilizador e para fins analíticos.</li>
                        </ul>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Lock color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Google AdSense e Cookies</h2>
                        </div>
                        <p>
                            A nossa plataforma utiliza o <strong>Google AdSense</strong> para exibir anúncios. É importante saber que:
                        </p>
                        <ul>
                            <li>Fornecedores de terceiros, incluindo a Google, utilizam cookies para apresentar anúncios com base em visitas anteriores do utilizador ao seu website ou a outros websites.</li>
                            <li>Com a utilização de cookies de publicidade, a Google e os parceiros dela podem apresentar anúncios aos utilizadores com base nas visitas que estes fizeram ao seu site e/ou a outros sites na Internet.</li>
                            <li>Os utilizadores podem desativar a publicidade personalizada ao aceder às <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Definições de Anúncios</a>.</li>
                        </ul>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Scale color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Os Seus Direitos</h2>
                        </div>
                        <p>
                            De acordo com regulamentos globais como o RGPD, tem o direito de aceder, corrigir ou eliminar os seus dados pessoais a qualquer momento. Para exercer esses direitos, contacte-nos através do suporte oficial da plataforma.
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '40px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            Última atualização: 26 de Janeiro de 2026.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
