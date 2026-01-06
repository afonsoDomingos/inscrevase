"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Palette, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

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
            <Link href="/comecar" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Começar Agora <ArrowRight size={20} />
            </Link>
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
