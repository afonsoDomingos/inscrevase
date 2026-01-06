"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Palette, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const galleryImages = [
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
];

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hero-title"
          >
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block' }}
            >
              Transforme seus eventos com
            </motion.span>
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block' }}
              className="gold-text luxury-shimmer"
            >
              Elegância e Exclusividade
            </motion.span>
            <motion.span
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'block', fontSize: '2.5rem', marginTop: '1rem', fontWeight: 400 }}
            >
              na <span style={{ fontWeight: 800 }}>Inscreva-se</span>
            </motion.span>
          </motion.h1>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            A plataforma de inscrições desenhada para mentores e palestrantes que prezam
            pelo branding de luxo e a melhor experiência para seus clientes.
          </motion.p>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/entrar" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Começar Agora <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Infinite Gallery Section */}
      <section style={{ overflow: 'hidden', padding: '0 0 4rem 0', background: '#fff' }}>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
          A escolha dos melhores mentores do mercado
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', overflow: 'hidden' }}>
          {/* Row 1: Left Scroll */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            style={{ display: 'flex', gap: '1.5rem', flexShrink: 0, paddingRight: '1.5rem' }}
          >
            {[...galleryImages, ...galleryImages].map((src, i) => (
              <div key={`row1-${i}`} style={{
                position: 'relative',
                width: '350px',
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <Image src={src} alt="Evento" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              </div>
            ))}
          </motion.div>

          {/* Row 2: Right Scroll (Reverse) */}
          <motion.div
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            style={{ display: 'flex', gap: '1.5rem', flexShrink: 0, paddingRight: '1.5rem' }}
          >
            {[...galleryImages, ...galleryImages].map((src, i) => (
              <div key={`row2-${i}`} style={{
                position: 'relative',
                width: '350px',
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <Image src={src} alt="Evento" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: '#fafafa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem' }}>Funcionalidades <span className="gold-text">Premium</span></h2>
            <p style={{ color: '#666', maxWidth: '600px', margin: '1rem auto' }}>
              Tudo o que você precisa para gerir suas inscrições com profissionalismo moçambicano.
            </p>
          </div>

          <div className="grid">
            <FeatureCard
              icon={<Palette className="gold-text" />}
              title="Branding Personalizado"
              description="Ajuste cores, fontes e logo para que o formulário tenha a cara do seu negócio."
            />
            <FeatureCard
              icon={<CheckCircle className="gold-text" />}
              title="Validação de Pagamentos"
              description="Upload de comprovativos (M-Pesa, E-Mola, Banco) com aprovação manual ou automática."
            />
            <FeatureCard
              icon={<Zap className="gold-text" />}
              title="Integração WhatsApp"
              description="Botão nativo para levar seus inscritos direto para sua comunidade ou suporte."
            />
            <FeatureCard
              icon={<BarChart3 className="gold-text" />}
              title="Dashboard Analítico"
              description="Acompanhe vendas, conversões e exporte dados para Excel com um clique."
            />
            <FeatureCard
              icon={<ShieldCheck className="gold-text" />}
              title="Segurança Máxima"
              description="Dados protegidos e conformidade com as melhores práticas de privacidade."
            />
            <FeatureCard
              icon={<Palette className="gold-text" />}
              title="Temas de Luxo"
              description="Escolha entre designs Minimalistas ou Luxo Clássico pré-configurados."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="section">
        <div className="container">
          <div className="luxury-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Pronto para elevar o nível dos seus eventos?</h2>
            <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>
              Junte-se aos melhores mentores de Moçambique e comece hoje mesmo.
            </p>
            <Link href="/cadastro" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
              Criar minha conta gratuita
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ padding: '4rem 0', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
            Inscreva<span className="gold-text">.se</span>
          </p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Inscreva-se Moçambique. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="luxury-card"
    >
      <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ color: '#666', lineHeight: 1.6 }}>{description}</p>
    </motion.div>
  );
}
