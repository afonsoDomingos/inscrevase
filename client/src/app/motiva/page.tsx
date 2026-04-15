"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Trophy, Upload, Video, Play, ThumbsUp, Share2, Info, X, 
  Type, CheckCircle, ShieldAlert,
  MessageCircle, Gift, AlertTriangle, Clock, Mail, User as UserIcon, Phone
} from 'lucide-react';
import { authService } from '@/lib/authService';

import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { motivaService, MotivaContest, MotivaEntry } from '@/lib/motivaService';

export default function MotivaPrototype() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real Data States
  const [contestData, setContestData] = useState<MotivaContest | null>(null);
  const [realEntries, setRealEntries] = useState<MotivaEntry[]>([]);
  const [historicalData, setHistoricalData] = useState<MotivaContest[]>([]);
  const [currentUploadCount, setCurrentUploadCount] = useState(0);
  
  // States for Upload Flow
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [textOverlay, setTextOverlay] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Contact States
  const [contactName, setContactName] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // States for Ranking/Feed
  const [activeTab, setActiveTab] = useState<'ranking' | 'historico' | 'regras'>('ranking');
  const [exampleVideos] = useState([
    { id: 1, author: 'Exemplo: Ana Silva', title: 'O Segredo da Persistência', likes: 1245, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=700', rank: 1, liked: false },
    { id: 2, author: 'Exemplo: Carlos Mendes', title: 'Nunca Desista', likes: 982, url: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=400&h=700', rank: 2, liked: true }
  ]);


  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
    if (token) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setContactName(currentUser.name || '');
            setContactEmail(currentUser.email || '');
        }
    }
    loadContestData();
  }, []);

  const loadContestData = async () => {
    setLoading(true);
    const result = await motivaService.getActiveContest();
    if (result) {
      setContestData(result.contest);
      setCurrentUploadCount(result.entryCount);
      
      // Load entries for this phase
      const entries = await motivaService.getEntries(result.contest.phase);
      setRealEntries(entries);
      
      // Update timer based on real endDate
      const end = new Date(result.contest.endDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, end - now);
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }

    const winners = await motivaService.getWinners();
    setHistoricalData(winners);
    setLoading(false);
  };

  // Timer set to exactly 1 month (30 days) to inaugurate Phase 1
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('O vídeo deve ter no máximo 50MB.');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const submitVideo = async () => {
    if (!videoFile) {
      toast.info('Por favor, faça primeiro o upload do seu vídeo motivacional antes de publicar! ✨', {
        style: {
          background: '#111',
          color: '#FFD700',
          border: '1px solid #FFD700'
        }
      });
      return;
    }
    if (!contestData) return;
    
    setIsUploading(true);
    try {
      // 1. Upload logic inspired by formService
      const formData = new FormData();
      formData.append('folder', 'motiva_contest');
      formData.append('file', videoFile);

      // We'll use the existing /api/upload endpoint which already maps to Cloudinary
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Erro ao fazer upload do vídeo para a nuvem.');
      }

      const uploadResult = await uploadResponse.json();
      const finalVideoUrl = uploadResult.url;

      // 2. Submit entry with final Cloudinary URL
      const entryResult = await motivaService.uploadEntry({
        title: textOverlay || 'Sem Título',
        videoUrl: finalVideoUrl,
        phase: contestData.phase,
        contactName,
        contactWhatsApp,
        contactEmail
      });
      
      if (entryResult && entryResult.incentiveSignup) {
        toast.success('Vídeo enviado com sucesso para aprovação!', {
          description: 'Crie uma conta para acompanhar o seu vídeo mais facilmente e participar nos votos!',
          action: {
            label: 'Criar Conta',
            onClick: () => window.location.href = '/cadastro'
          },
          duration: 10000,
        });
      } else {
        toast.success('Vídeo enviado com sucesso para aprovação!');
      }
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setVideoPreviewUrl('');
      setVideoFile(null);
      setTextOverlay('');
      loadContestData(); // Refresh counts
    } catch (error) {
      const message = (error as Error).message || 'Erro ao enviar vídeo.';
      toast.error(message);
      setIsUploading(false);
    }
  };

  const handleLike = async (entryId: string) => {
    if (!isLoggedIn) {
      toast.error('Tem de iniciar sessão para votar.');
      return;
    }
    
    try {
      const result = await motivaService.toggleLike(entryId);
      setRealEntries(prev => prev.map(entry => {
        if (entry._id === entryId) {
          return { ...entry, likeCount: result.likes, liked: result.liked };
        }
        return entry;
      }));
    } catch (error) {
      const message = (error as Error).message || 'Erro ao votar.';
      toast.error(message);
    }
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
            <span style={{ color: '#fff' }}>Prémio</span> <span style={{ color: '#FFD700' }}>MOTIVA</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Fase atual: <strong style={{ color: '#fff' }}>FASE {contestData?.phase || 1}</strong>. {contestData ? 'Inspire milhares de pessoas e concorra aos prémios reais!' : 'Prepare-se: novas fases e prémios reais em breve.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', padding: '12px 24px', borderRadius: '12px' }}>
              <Gift size={22} color="#FFD700" />
              <span style={{ fontSize: '1.1rem' }}>
                <strong>Prémio Fase {contestData?.phase || 1}:</strong> {contestData ? `${contestData.rewardTitle} - ${contestData.rewardValue}` : 'Carregando prémios reais...'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} style={{ background: '#111', padding: '12px 20px', borderRadius: '12px', border: '1px solid #333', minWidth: '80px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>{loading ? '--' : String(value).padStart(2, '0')}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{unit === 'days' ? 'Dias' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (!contestData) {
                toast.error('Nenhum concurso ativo no momento.');
                return;
              }
              if (currentUploadCount >= (contestData.maxUploads || 10)) {
                toast.error(`O limite de ${contestData.maxUploads} vídeos da Fase ${contestData.phase} já foi alcançado. Aguarde e prepare-se para a próxima fase! 🔥`, { duration: 6000 });
                return;
              }
              setIsUploadModalOpen(true);
            }}
            className="motiva-cta-button"
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
        <div className="motiva-tab-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => setActiveTab('ranking')}
            className={`motiva-tab-button ${activeTab === 'ranking' ? 'active' : ''}`}
          >
            Ranking Global
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            className={`motiva-tab-button ${activeTab === 'historico' ? 'active' : ''}`}
          >
            Edições Anteriores
          </button>
          <button 
            onClick={() => setActiveTab('regras')}
            className={`motiva-tab-button ${activeTab === 'regras' ? 'active' : ''}`}
          >
            Regras do Concurso
          </button>
        </div>

        {/* Ranking Feed */}
        {activeTab === 'ranking' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Real Entries */}
            {realEntries.map((entry, index) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={entry._id} style={{ 
                background: '#111', 
                borderRadius: '20px', 
                overflow: 'hidden',
                border: index === 0 ? '2px solid #FFD700' : '1px solid #222',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '15px', 
                  left: '15px', 
                  background: index === 0 ? 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' : 
                             index === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                             index === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' : 'rgba(0,0,0,0.8)', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 900, 
                  color: index < 3 ? '#000' : '#fff', 
                  zIndex: 10,
                  boxShadow: index < 3 ? '0 4px 15px rgba(0,0,0,0.5)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {index === 0 && <Trophy size={14} />}
                  #{index + 1}
                  {index < 3 && <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>TOP</span>}
                </div>
                
                <div style={{ position: 'relative', height: '450px', background: '#000' }}>
                  <video 
                    src={entry.videoUrl} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                    muted 
                    loop 
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    poster={entry.videoUrl.replace(/\.[^/.]+$/, ".jpg")} // Basic Cloudinary auto-thumb trick
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={24} color="#fff" fill="#fff" />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>{entry.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>por {entry.contactName || entry.user?.name || 'Participante'}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleLike(entry._id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        background: entry.liked ? 'rgba(255, 215, 0, 0.2)' : '#222', 
                        border: 'none', padding: '8px 16px', borderRadius: '15px', 
                        color: entry.liked ? '#FFD700' : '#fff', 
                        cursor: 'pointer', fontWeight: 600, transition: '0.2s'
                      }}
                    >
                      <ThumbsUp size={16} fill={entry.liked ? '#FFD700' : 'none'} />
                      {entry.likeCount}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        title="Partilhar no WhatsApp" 
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Vota no meu vídeo "${entry.title}" no concurso MOTIVA da Inscreva-se! ` + window.location.href)}`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.3)', color: '#25D366', padding: '8px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <MessageCircle size={20} />
                      </button>
                      <button title="Partilhar Link" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado!'); }} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '5px' }}><Share2 size={20} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Example Videos (Instructional) */}
            {realEntries.length === 0 && exampleVideos.map((video) => (
              <div key={video.id} style={{ 
                background: '#111', 
                borderRadius: '20px', 
                overflow: 'hidden',
                border: '1px solid #222',
                opacity: 0.6,
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,215,0,0.2)', color: '#FFD700', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, zIndex: 10 }}>EXEMPLO</div>
                <div style={{ position: 'relative', height: '450px', background: '#222' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>{video.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>{video.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historical Feed (Past Winners) */}
        {activeTab === 'historico' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '30px', color: '#FFD700', textAlign: 'center' }}>Vencedores Anteriores</h2>
            <div style={{ display: 'grid', gap: '40px' }}>
              {historicalData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', borderRadius: '24px', border: '1px dashed #333' }}>
                  <Trophy size={48} color="#333" style={{ marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>Ainda sem Edições Anteriores</h3>
                  <p style={{ color: '#aaa' }}>Nós estamos apenas na nossa Fase Inicial. Os próximos vencedores farão parte da história aqui.</p>
                </div>
              ) : (
                historicalData.map((hist) => (
                  <div key={hist._id} style={{ background: '#111', borderRadius: '24px', overflow: 'hidden', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px 30px', background: 'linear-gradient(90deg, #222, #111)', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFD700' }}>FASE {hist.phase}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}><Trophy size={16} /> Verificado pelos Admins</div>
                    </div>
                    {hist.winner && (
                      <div style={{ display: 'flex', padding: '30px', gap: '30px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '200px', height: '350px', borderRadius: '15px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={hist.winner.videoUrl} alt={hist.winner.videoTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px', color: '#fff' }}>{hist.winner.videoTitle}</h4>
                          <p style={{ color: '#FFD700', fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>por {hist.winner.name}</p>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#222', padding: '8px 16px', borderRadius: '15px', color: '#fff', fontWeight: 600 }}>
                            <ThumbsUp size={16} fill="#FFD700" color="#FFD700" />
                            {hist.winner.likes} Gotos na fase final
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Rules Section */}
        {activeTab === 'regras' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '30px', color: '#FFD700' }}>Regras do Concurso MOTIVA</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Clock size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>Ciclos de 1 Mês</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>O concurso MOTIVA está unicamente estruturado por <b>Fases exclusivas com a duração exata de 1 mês (30 dias)</b>. Após o relógio zerar, não são contabilizados mais envios ou votos, e a fase é oficial e definitivamente encerrada.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Video size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>Formato e Duração</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>Os vídeos devem ser gravados na vertical (formato Reels/TikTok) e ter a duração <b>máxima de 1 minuto (60 segundos)</b>. Vídeos com maior duração serão automaticamente desclassificados.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><Info size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>Conteúdo Motivacional</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>O núcleo da mensagem deve ser estritamente inspirador, educativo ou motivacional. Fale sobre superação, carreira, foco ou desenvolvimento pessoal.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}><ShieldAlert size={24} color="#FFD700" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>Conduta e Respeito</h3>
                  <p style={{ color: '#aaa', lineHeight: 1.5 }}>Não é permitido o uso de linguagem ofensiva, difamação, nudez ou qualquer conteúdo que viole os termos de comunidade. O respeito mútuo é obrigatório.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginTop: '10px', borderTop: '1px dashed #333', paddingTop: '30px' }}>
                <div style={{ background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,107,107,0.3)' }}><AlertTriangle size={24} color="#ff6b6b" /></div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '5px', color: '#ff6b6b', textTransform: 'uppercase' }}>Defesa Anti-Fraudes (Auditoria OBRIGATÓRIA)</h3>
                  <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '1rem' }}>
                    <strong>1 Conta = 1 Voto.</strong> Apenas os likes dados por utilizadores reais e engajados são contabilizados perante a nossa base de dados. Todo o nosso sistema possui auditoria severa contra votos falsos. A deteção de criação sistemática de contas múltiplas, <em>bots</em> ou farms de likes resultará na <b style={{ color: '#ff6b6b' }}>desclassificação imediata e irreversível</b> do participante ou vídeo do Hall of Fame. Jogue limpo e inspire!
                  </p>
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
              className="motiva-upload-modal"
            >
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={20} />
              </button>

              {/* Preview Area (Left side) */}
              <div className="motiva-upload-modal-left">
                {!videoPreviewUrl ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px dashed rgba(255, 215, 0, 0.3)' }}>
                      <Upload size={32} color="#FFD700" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>O Teu Vídeo Motivacional</h3>
                    <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '300px', margin: '0 auto 2.5rem' }}>Arraste o ficheiro ou clique no botão abaixo. Formato vertical (9:16) até 60s.</p>
                    <label style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#000', padding: '14px 28px', borderRadius: '50px', fontWeight: 800, fontSize: '0.9rem' }}>
                      ESCOLHER FICHEIRO
                      <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <div className="motiva-upload-video-container">
                    <video ref={videoRef} src={videoPreviewUrl} controls controlsList="nodownload" />
                    {textOverlay && (
                      <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', textAlign: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 900, textShadow: '2px 2px 8px rgba(0,0,0,1)', zIndex: 5, pointerEvents: 'none', lineHeight: 1.1, textTransform: 'uppercase' }}>
                        {textOverlay}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Editor Tools (Right side) */}
              <div className="motiva-upload-modal-right">
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFD700', letterSpacing: '-0.5px', marginBottom: '4px' }}>Finalizar Candidatura</h3>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>Preencha os dados abaixo para submeter o seu vídeo ao júri.</p>
                </div>
                
                <div style={{ flex: 1, opacity: 1, pointerEvents: 'auto' }}>
                  <div className="motiva-input-group">
                    <label><Type size={16} /> Título ou Frase de Impacto</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Não desista do seu sonho..."
                      className="motiva-input"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      maxLength={40}
                    />
                  </div>

                  <div className="motiva-input-group">
                    <label><UserIcon size={16} /> O Teu Nome Completo</label>
                    <input 
                      type="text" 
                      value={contactName} 
                      onChange={(e) => setContactName(e.target.value)} 
                      placeholder="Afonso Domingos" 
                      className="motiva-input"
                    />
                  </div>

                  <div className="motiva-input-group">
                    <label><Phone size={16} /> WhatsApp de Contacto</label>
                    <input 
                      type="text" 
                      value={contactWhatsApp} 
                      onChange={(e) => setContactWhatsApp(e.target.value)} 
                      placeholder="Ex: 84 123 4567" 
                      className="motiva-input"
                    />
                  </div>

                  <div className="motiva-input-group">
                    <label><Mail size={16} /> Email Principal</label>
                    <input 
                      type="email" 
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)} 
                      placeholder="nome@gmail.com" 
                      className="motiva-input"
                    />
                  </div>

                  <div style={{ background: 'rgba(255,215,0,0.05)', padding: '12px 16px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(255,215,0,0.1)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Info size={16} color="#FFD700" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: 1.4 }}>
                        Ao publicar, o seu vídeo será analisado pela nossa equipa. Se aprovado, entrará no ranking oficial da <strong style={{color: '#fff'}}>Fase {contestData?.phase}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={submitVideo}
                  disabled={isUploading}
                  style={{
                    padding: '14px',
                    borderRadius: '50px',
                    background: isUploading ? '#333' : '#FFD700',
                    color: isUploading ? '#888' : '#000',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
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
