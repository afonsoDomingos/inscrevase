"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Youtube, Facebook, MessageCircle, Instagram } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';
import { SUPPORT_WHATSAPP } from '@/lib/constants';

export default function Footer() {
    const { t } = useTranslate();

    return (
        <footer style={{ padding: '80px 0 40px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <div className="container">
                {/* Multi-column Footer Links */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '40px',
                    marginBottom: '60px',
                    paddingTop: '20px'
                }}>
                    {/* Brand Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Image src="/logo.png" alt="Inscreva-se" width={40} height={40} style={{ borderRadius: '8px' }} />
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Inscreva-se</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                            A plataforma líder em gestão de eventos e mentoria em Angola e Moçambique. Transforme o seu conhecimento em impacto global.
                        </p>
                    </div>

                    {/* Product Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>Produto</h4>
                        <Link href="/explorar" className="footer-link-new">Explorar Eventos</Link>
                        <Link href="/experts" className="footer-link-new">Nossos Experts</Link>
                        <Link href="/planos" className="footer-link-new">Preços e Planos</Link>
                        <Link href="/funcionalidades" className="footer-link-new">Funcionalidades</Link>
                    </div>

                    {/* Resources Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>Recursos</h4>
                        <Link href="/blog" className="footer-link-new">Blog & Artigos</Link>
                        <Link href="/vagas" className="footer-link-new">Oportunidades (Vagas)</Link>
                        <Link href="/suporte" className="footer-link-new">Central de Ajuda</Link>
                        <Link href="/feedback" className="footer-link-new">Feedback</Link>
                    </div>

                    {/* Legal Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>Legal</h4>
                        <Link href="/termos" className="footer-link-new">Termos de Uso</Link>
                        <Link href="/privacidade" className="footer-link-new">Política de Privacidade</Link>
                        <Link href="/sobre-nos" className="footer-link-new">Sobre Nós</Link>
                        <Link href="/anunciar" className="footer-link-new">Anunciar Conosco</Link>
                    </div>
                </div>

                {/* Developer Credits Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '40px',
                    borderTop: '1px solid #f0f0f0',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ color: '#5c5e62', fontSize: '0.85rem' }}>
                        Inscreva-se &copy; {new Date().getFullYear()}. Todos os direitos reservados.
                    </div>
                    
                    <a
                        href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>Developed by</span>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: 'var(--gold-gradient)',
                        }}>
                            <Image
                                src="/developer-vibe.jpg"
                                alt="Developer"
                                width={32}
                                height={32}
                                style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
                            />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a1a1a' }}>Vibe</span>
                    </a>
                </div>
            </div>
            <style jsx>{`
                :global(.footer-link-new) {
                    text-decoration: none !important;
                    color: #5c5e62 !important;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                :global(.footer-link-new:hover) {
                    color: #1452AD !important;
                    padding-left: 5px;
                }
            `}</style>
        </footer>
    );
}
