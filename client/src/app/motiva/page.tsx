"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Trophy, Upload, Video, Play, ThumbsUp, Share2, Info, X, 
  Scissors, Type, CheckCircle, ShieldAlert,
  MessageCircle, Gift, AlertTriangle, Clock
} from 'lucide-react';

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
  const [textOverlay, setTextOverlay] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // States for Ranking/Feed
  const [activeTab, setActiveTab] = useState<'ranking' | 'historico' | 'regras'>('ranking');
  const [exampleVideos] = useState([
    { id: 1, author: 'Exemplo: Ana Silva', title: 'O Segredo da Persistência', likes: 1245, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=700', rank: 1, liked: false },
    { id: 2, author: 'Exemplo: Carlos Mendes', title: 'Nunca Desista', likes: 982, url: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=400&h=700', rank: 2, liked: true }
  ]);


  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
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
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const submitVideo = async () => {
    if (!contestData) return;
    
    setIsUploading(true);
    try {
      await motivaService.uploadEntry({
        title: textOverlay || 'Sem Título',
        videoUrl: videoPreviewUrl, // No protótipo ainda é um blob URL, na real seria o link do storage
        phase: contestData.phase
      });
      
      toast.success('Vídeo enviado com sucesso para aprovação!');
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setVideoPreviewUrl('');
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
            Prémio <span style={{ color: '#FFD700' }}>MOTIVA</span>
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
              if (!isLoggedIn) {
                toast.error('Inicie sessão para participar!');
                return;
              }
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
            onClick={() => setActiveTab('historico')}
            style={{
              padding: '12px 30px',
              background: activeTab === 'historico' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: activeTab === 'historico' ? '#FFD700' : '#888',
              border: activeTab === 'historico' ? '1px solid #FFD700' : '1px solid #333',
              borderRadius: '30px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Edições Anteriores
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
                <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.8)', padding: '5px 12px', borderRadius: '20px', fontWeight: 800, color: index === 0 ? '#FFD700' : '#fff', zIndex: 10 }}>
                  #{index + 1}
                </div>
                
                <div style={{ position: 'relative', height: '450px', background: '#222' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.videoUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=700'} alt={entry.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Play size={24} color="#fff" fill="#fff" />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '5px', color: '#fff' }}>{entry.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '15px' }}>por {entry.user?.name || 'Utilizador'}</p>
                  
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
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Arraste o seu vídeo vertical</h3>
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
