"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Trophy, Upload, Video, Play, ThumbsUp, Share2, Info, X, 
  Instagram, Facebook, Scissors, Type, CheckCircle, ShieldAlert 
} from 'lucide-react';

import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function MotivaPrototype() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // States for Upload Flow
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [textOverlay, setTextOverlay] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // States for Ranking/Feed
  const [activeTab, setActiveTab] = useState<'ranking' | 'regras'>('ranking');
  const [videos, setVideos] = useState([
    { id: 1, author: 'Ana Silva', title: 'O Segredo da Persistência', likes: 1245, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=700', rank: 1, liked: false },
    { id: 2, author: 'Carlos Mendes', title: 'Nunca Desista', likes: 982, url: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=400&h=700', rank: 2, liked: true },
    { id: 3, author: 'Mariana Costa', title: 'Superando Limites', likes: 856, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400&h=700', rank: 3, liked: false },
    { id: 4, author: 'João Pedro', title: 'Acorde Cedo, Vença', likes: 640, url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=400&h=700', rank: 4, liked: false }
  ]);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('O vídeo deve ter no máximo 50MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const submitVideo = () => {
    setIsUploading(true);
    setTimeout(() => {
      toast.success('Vídeo enviado com sucesso para aprovação!');
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setVideoPreviewUrl('');
      setTextOverlay('');
    }, 2000);
  };

  const handleLike = (id: number) => {
    if (!isLoggedIn) {
      toast.error('Tem de iniciar sessão para votar.');
      return;
    }
    setVideos(videos.map(v => {
      if (v.id === id) {
        return { ...v, likes: v.liked ? v.likes - 1 : v.likes + 1, liked: !v.liked };
      }
      return v;
    }));
  };

  return (
    <main style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        padding: '160px 20px 80px', 
        textAlign: 'center',
        background: 'radial-gradient(circle at top, rgba(212, 175, 55, 0.15) 0%, #050505 60%)'
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 215, 0, 0.1)', padding: '8px 16px', borderRadius: '50px', color: '#FFD700', marginBottom: '1.5rem', fontWeight: 600 }}>
            <Trophy size={18} />
            CONCURSO OFICIAL
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-2px', textTransform: 'uppercase' }}>
            Prémio <span style={{ color: '#FFD700' }}>MOTIVA</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Inspire milhares de pessoas. Faça upload do seu vídeo motivacional (máx. 1 minuto), concorra ao topo do ranking e ganhe prémios exclusivos da Inscreva-se.
          </p>
          
          <button 
            onClick={() => isLoggedIn ? setIsUploadModalOpen(true) : toast.error('Inicie sessão para participar!')}
            style={{
              padding: '16px 40px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Upload size={20} />
            PARTICIPAR AGORA
          </button>
          
          {!isLoggedIn && (
            <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#888' }}>
              Ainda não tem conta? <Link href="/cadastro" style={{ color: '#FFD700' }}>Crie agora</Link>
            </p>
          )}
        </motion.div>
      </section>

      {/* Main Content Tabs */}
      <div className="container" style={{ padding: '0 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => setActiveTab('ranking')}
            style={{
              padding: '12px 30px',
              background: activeTab === 'ranking' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: activeTab === 'ranking' ? '#FFD700' : '#888',
              border: activeTab === 'ranking' ? '1px solid #FFD700' : '1px solid #333',
              borderRadius: '30px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Ranking Global
          </button>
          <button 
            onClick={() => setActiveTab('regras')}
            style={{
              padding: '12px 30px',
              background: activeTab === 'regras' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: activeTab === 'regras' ? '#FFD700' : '#888',
              border: activeTab === 'regras' ? '1px solid #FFD700' : '1px solid #333',
              borderRadius: '30px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Regras do Concurso
          </button>
        </div>

        {/* Ranking Feed */}
        {activeTab === 'ranking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {videos.map((video) => (
              <div key={video.id} style={{ 
                background: '#111', 
                borderRadius: '20px', 
                overflow: 'hidden',
                border: video.rank === 1 ? '2px solid #FFD700' : '1px solid #222',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.8)', padding: '5px 12px', borderRadius: '20px', fontWeight: 800, color: video.rank === 1 ? '#FFD700' : '#fff', zIndex: 10 }}>
                  #{video.rank}
                </div>
                
                {/* Simulated Video Placeholder */}
                <div style={{ position: 'relative', height: '450px', background: '#222' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Play size={24} color="#fff" fill="#fff" />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '5px' }}>{video.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>por {video.author}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleLike(video.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        background: video.liked ? 'rgba(255, 215, 0, 0.2)' : '#222', 
                        border: 'none', padding: '8px 16px', borderRadius: '15px', 
                        color: video.liked ? '#FFD700' : '#fff', 
                        cursor: 'pointer', fontWeight: 600, transition: '0.2s'
                      }}
                    >
                      <ThumbsUp size={16} fill={video.liked ? '#FFD700' : 'none'} />
                      {video.likes}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button title="Partilhar" style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><Share2 size={20} /></button>
                      <button title="Instagram" style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><Instagram size={20} /></button>
                      <button title="Facebook" style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><Facebook size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Rules Section */}
        {activeTab === 'regras' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '30px', color: '#FFD700' }}>Regras do Concurso MOTIVA</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Video size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px' }}>Formato e Duração</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>Os vídeos devem ser gravados na vertical (formato Reels/TikTok) e ter a duração <b>máxima de 1 minuto (60 segundos)</b>. Vídeos com maior duração serão automaticamente desclassificados.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Info size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px' }}>Conteúdo Motivacional</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>O núcleo da mensagem deve ser estritamente inspirador, educativo ou motivacional. Fale sobre superação, carreira, foco ou desenvolvimento pessoal.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><ShieldAlert size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px' }}>Conduta e Respeito</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>Não é permitido o uso de linguagem ofensiva, difamação, nudez ou qualquer conteúdo que viole os termos de comunidade. O respeito mútuo é obrigatório.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ background: '#111', width: '100%', maxWidth: '900px', borderRadius: '24px', border: '1px solid #333', position: 'relative', display: 'flex', overflow: 'hidden', minHeight: '600px' }}
            >
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={20} />
              </button>

              {/* Preview Area (Left side) */}
              <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #222', position: 'relative' }}>
                {!videoPreviewUrl ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Upload size={48} color="#FFD700" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Arraste o seu vídeo vertical</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>MP4 ou MOV. Máximo 60 segundos.</p>
                    <label style={{ cursor: 'pointer', background: '#333', padding: '12px 24px', borderRadius: '50px', fontWeight: 600 }}>
                      Selecionar Ficheiro
                      <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ position: 'relative', width: '300px', height: '533px', borderRadius: '20px', overflow: 'hidden', background: '#222', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                      <video ref={videoRef} src={videoPreviewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls controlsList="nodownload" />
                      {textOverlay && (
                        <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', textAlign: 'center', color: '#fff', fontSize: '2rem', fontWeight: 900, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', zIndex: 5, pointerEvents: 'none' }}>
                          {textOverlay}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Tools (Right side) */}
              <div style={{ width: '350px', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: '#FFD700' }}>Edição Rápida</h3>
                
                <div style={{ flex: 1, opacity: videoPreviewUrl ? 1 : 0.4, pointerEvents: videoPreviewUrl ? 'auto' : 'none' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#aaa', marginBottom: '10px' }}><Type size={16} /> Texto Sobreposto</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Não desista hoje"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      maxLength={40}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff', outline: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#aaa', marginBottom: '10px' }}><Scissors size={16} /> Corte Simples</label>
                    <div style={{ background: '#000', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>Ajuste a duração (apenas simulação protótipo)</p>
                      <input type="range" min="0" max="60" defaultValue="60" style={{ width: '100%', accentColor: '#FFD700' }} />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,0,0,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>Ao enviar, concorda que o seu conteúdo tem duração menor que 1 minuto e respeita as regras do concurso.</p>
                  </div>
                </div>

                <button 
                  onClick={submitVideo}
                  disabled={!videoPreviewUrl || isUploading}
                  style={{
                    padding: '16px',
                    borderRadius: '50px',
                    background: (!videoPreviewUrl || isUploading) ? '#333' : '#FFD700',
                    color: (!videoPreviewUrl || isUploading) ? '#888' : '#000',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: (!videoPreviewUrl || isUploading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%'
                  }}
                >
                  {isUploading ? 'A ENVIAR...' : (videoPreviewUrl ? <><CheckCircle size={20} /> PUBLICAR VÍDEO</> : 'AGUARDANDO VÍDEO')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
