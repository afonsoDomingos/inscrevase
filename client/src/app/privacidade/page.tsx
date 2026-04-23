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
            <div style={{
                position: 'relative',
                background: '#000',
                color: '#fff',
                padding: '160px 20px 100px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Background Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(20, 82, 173, 0.3) 0%, #000 70%)',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.5,
                    backgroundImage: 'url("/header-bg-new.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}
                >
                    <Shield size={70} color="#FFD700" style={{ marginBottom: '25px', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.3))' }} />
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        fontWeight: 900,
                        marginBottom: '25px',
                        fontFamily: 'var(--font-playfair, serif)',
                        textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        lineHeight: 1.1,
                        color: '#60a5fa'
                    }}>
                        Política de <span style={{
                            color: '#FFD700',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}>Privacidade</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.2rem, 2vw, 1.4rem)',
                        color: '#f0f0f0',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Na Inscreva-se, a sua privacidade é a nossa prioridade. Conheça como protegemos os seus dados com segurança de nível bancário.
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
                            A Inscreva-se (&quot;nós&quot;, &quot;plataforma&quot;) está empenhada em proteger a privacidade dos seus utilizadores.
                            Esta Política de Privacidade explica como recolhemos, utilizamos e protegemos as informações quando utiliza
                            o nosso site e serviços. Ao utilizar a nossa plataforma, concorda com as práticas descritas nesta política.
                        </p>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Eye color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Recolha de Informação e Cookies</h2>
                        </div>
                        <p>Recolhemos informações de diversas formas, incluindo:</p>
                        <ul>
                            <li><strong>Informações fornecidas por si:</strong> Nome, e-mail e dados de contacto ao registar-se como mentor ou participante.</li>
                            <li><strong>Dados de Utilização:</strong> Informações sobre como utiliza o site, incluindo o seu endereço IP, tipo de navegador e páginas visitadas.</li>
                        </ul>
                        <p style={{ marginTop: '15px' }}>
                            O Inscreva-se utiliza cookies para melhorar a experiência de navegação. Os principais cookies utilizados são:
                        </p>
                        <ul>
                            <li><strong>Cookies de sessão:</strong> para manter o seu estado de login.</li>
                            <li><strong>Google Analytics:</strong> para análise de tráfego anónima. Saiba mais em <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>policies.google.com/privacy</a>.</li>
                            <li><strong>Google AdSense:</strong> para exibição de anúncios personalizados. Saiba mais em <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>policies.google.com/technologies/ads</a>.</li>
                        </ul>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Lock color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Google AdSense e Publicidade</h2>
                        </div>
                        <p>
                            A nossa plataforma utiliza o <strong>Google AdSense</strong>, um serviço de publicidade da <strong>Google LLC</strong> (1600 Amphitheatre Parkway, Mountain View, CA 94043, EUA), para exibir anúncios. Ao visitar o nosso site, concorda que a Google possa exibir anúncios com base nos seus interesses.
                        </p>
                        <ul>
                            <li><strong>Cookies DART:</strong> A Google utiliza o cookie DART para veicular anúncios aos utilizadores com base na visita a este site e a outros sites na Internet. Os utilizadores podem desativar o uso do cookie DART visitando a <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Política de Privacidade de anúncios e conteúdo da Google</a>.</li>
                            <li><strong>Cookies de terceiros:</strong> Fornecedores de terceiros, incluindo a Google, utilizam cookies para apresentar anúncios com base em visitas anteriores do utilizador a este website ou a outros websites.</li>
                            <li><strong>Publicidade personalizada:</strong> Com a utilização de cookies de publicidade, a Google e os parceiros podem apresentar anúncios personalizados com base nas suas visitas a este e outros sites na Internet.</li>
                            <li><strong>Como desativar:</strong> Os utilizadores podem desativar a publicidade personalizada acedendo às <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Definições de Anúncios da Google</a> ou através do <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Network Advertising Initiative opt-out</a>.</li>
                            <li><strong>Política completa do Google:</strong> Para mais informações, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Política de Privacidade da Google</a>.</li>
                        </ul>
                        <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#64748b' }}>
                            O uso do Google AdSense por esta plataforma está em conformidade com as <a href="https://support.google.com/adsense/answer/48182" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>Políticas do Programa AdSense</a>.
                        </p>
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

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Lock color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Partilha de Dados com Terceiros</h2>
                        </div>
                        <p>Não vendemos, alugamos nem partilhamos os seus dados pessoais com terceiros, exceto:</p>
                        <ul>
                            <li><strong>Google Analytics:</strong> para análise de tráfego.</li>
                            <li><strong>Google AdSense:</strong> para exibição de anúncios.</li>
                            <li><strong>Quando exigido por lei:</strong> ou por autoridade competente.</li>
                        </ul>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <Shield color="#FFD700" />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#000', margin: 0 }}>Segurança dos Dados</h2>
                        </div>
                        <p>
                            Adotamos medidas técnicas e organizacionais adequadas para proteger os seus dados contra acesso não autorizado, alteração, divulgação ou destruição. As palavras-passe são armazenadas de forma rigorosamente encriptada.
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '40px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            Última atualização: 4 de Março de 2026.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
