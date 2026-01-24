"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Youtube, Facebook, MessageCircle } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export default function Footer() {
    const { t } = useTranslate();

    return (
        <footer style={{ padding: '80px 0 40px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <div className="container">
                {/* Developer Credits Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '40px',
                    paddingBottom: '40px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <a
                        href="https://www.linkedin.com/in/afonso-domingos-6b59361a5/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            padding: '3px',
                            background: 'var(--gold-gradient)',
                            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.2)',
                            transition: 'all 0.3s ease'
                        }}>
                            <Image
                                src="/developer-vibe.jpg"
                                alt="Vibe - Developer"
                                width={80}
                                height={80}
                                style={{
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid #fff'
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                fontSize: '0.7rem',
                                color: '#999',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                marginBottom: '4px'
                            }}>
                                {t('landing.footer.developedBy') || 'Desenvolvido por'}
                            </p>
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                background: 'var(--gold-gradient)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: 'var(--font-poppins)'
                            }}>
                                Vibe
                            </p>
                        </div>
                    </a>
                </div>

                {/* Social Links */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    marginBottom: '40px'
                }}>
                    {[
                        { icon: Linkedin, url: 'https://www.linkedin.com/company/inscreva-se', color: '#0077B5', label: 'LinkedIn' },
                        { icon: Youtube, url: 'https://www.youtube.com/@Inscreva-se-events', color: '#FF0000', label: 'YouTube' },
                        { icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61586427553486&locale=pt_BR', color: '#1877F2', label: 'Facebook' },
                        { icon: MessageCircle, url: 'https://wa.me/258856079576', color: '#25D366', label: 'WhatsApp' }
                    ].map((social) => (
                        <motion.a
                            key={social.label}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{
                                scale: 1.15,
                                y: -8,
                                boxShadow: `0 15px 30px ${social.color}33`,
                                borderColor: social.color,
                                color: social.color
                            }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '56px',
                                height: '56px',
                                borderRadius: '18px',
                                background: '#fff',
                                color: '#444',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                border: '1px solid #eee'
                            }}
                        >
                            <social.icon size={24} strokeWidth={1.5} />
                        </motion.a>
                    ))}
                </div>

                {/* Footer Links */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    color: '#5c5e62',
                    fontWeight: 600
                }}>
                    <span>Inscreva-se © {new Date().getFullYear()}</span>
                    <Link href="/privacidade" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.privacyTerms')}</Link>
                    <Link href="/mentores" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.events')}</Link>
                    <Link href="/suporte" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.support')}</Link>
                    <Link href="/entrar" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.login')}</Link>
                    <Link href="/cadastro" style={{ textDecoration: 'none', color: 'inherit' }}>{t('landing.footer.startNow')}</Link>
                </div>
            </div>
        </footer>
    );
}
