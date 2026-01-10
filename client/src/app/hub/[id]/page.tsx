"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Video,
    MessageCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Instagram,
    Linkedin,
    Loader2,
    QrCode,
    Navigation,
    Info,
    Award
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { generateCertificate } from '@/lib/certificateGenerator';

interface SubmissionData {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'pending';
    submittedAt: string;
    form: {
        _id: string;
        title: string;
        description: string;
        coverImage: string;
        logo: string;
        eventDate: string;
        location?: string;
        onlineLink?: string;
        whatsappConfig?: {
            communityUrl: string;
        };
        creator: {
            name: string;
            profilePhoto: string;
            bio: string;
            socialLinks?: {
                instagram?: string;
                linkedin?: string;
                website?: string;
            };
        };
        theme: {
            primaryColor: string;
            backgroundColor: string;
        };
    };
}

function HubContent() {
    const { id } = useParams();
    const router = useRouter();
    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setSubmission(data);
                } else {
                    toast.error("Inscrição não encontrada");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [id]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
            <Loader2 className="animate-spin" size={40} color="#171A20" />
        </div>
    );

    if (!submission) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#171A20' }}>
            <h1>Inscrição não encontrada</h1>
            <button onClick={() => router.push('/')} style={{ marginTop: '1rem', color: '#171A20', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Voltar ao início</button>
        </div>
    );

    const { form } = submission;
    const primaryColor = form.theme?.primaryColor || '#E82127'; // Tesla Red if not defined
    const isApproved = submission.status === 'approved' || submission.paymentStatus === 'paid';

    return (
        <main style={{ minHeight: '100vh', background: '#f4f4f4', color: '#171A20', fontFamily: 'var(--font-inter), sans-serif', padding: '0' }}>
            {/* Top Navigation Bar - Tesla Style */}
            <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', zIndex: 100, padding: '15px 24px', borderBottom: '1px solid #eee' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <div style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        PASSAPORTE <span style={{ fontWeight: 300, color: '#888' }}>ID: {id?.toString().slice(-6).toUpperCase()}</span>
                    </div>
                    <button style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                        <Share2 size={18} />
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 100px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isApproved ? '#10b981' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700, marginBottom: '20px' }}
                    >
                        {isApproved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {isApproved ? 'CONDUÇÃO CONFIRMADA' : 'EM PROCESSAMENTO'}
                    </motion.div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: '10px' }}>{form.title}</h1>
                    <p style={{ color: '#5C5E62', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Seu acesso premium está garantido. Prepare-se para uma experiência de alto desempenho.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }} className="hub-grid">

                    {/* Left Column: Details */}
                    <div style={{ display: 'grid', gap: '30px' }}>

                        {/* Event Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #eee' }}
                        >
                            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                <Image src={form.coverImage || '/event-placeholder.jpg'} alt={form.title} fill style={{ objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: '#fff' }}>
                                    <div style={{ display: 'flex', gap: '30px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '5px' }}>Data</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{form.eventDate ? new Date(form.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' }) : 'A definir'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '5px' }}>Horário</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{form.eventDate ? new Date(form.eventDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'A definir'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '5px' }}>Modelo</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{form.location ? 'Presencial' : 'Digital'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Location & Links */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {form.location && (
                                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Navigation size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Localização</div>
                                        <div style={{ fontSize: '0.85rem', color: '#5C5E62', lineHeight: 1.5 }}>{form.location}</div>
                                    </div>
                                    <button style={{ marginTop: 'auto', background: '#f4f4f4', border: 'none', padding: '10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Explorar Rota</button>
                                </div>
                            )}
                            {form.onlineLink && (
                                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Transmissão Online</div>
                                        <div style={{ fontSize: '0.85rem', color: '#5C5E62' }}>Link disponível na sua cabine</div>
                                    </div>
                                    <a href={form.onlineLink} target="_blank" style={{ marginTop: 'auto', background: primaryColor, color: '#fff', border: 'none', padding: '10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>Acessar Link</a>
                                </div>
                            )}
                        </div>

                        {/* Mentor Section */}
                        <div style={{ background: '#171A20', padding: '40px', borderRadius: '24px', color: '#fff', display: 'flex', gap: '30px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                                <Image src={form.creator.profilePhoto || '/default-avatar.png'} alt={form.creator.name} fill style={{ borderRadius: '20px', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: primaryColor, padding: '5px', borderRadius: '50%', border: '3px solid #171A20' }}>
                                    <ShieldCheck size={14} color="#fff" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '1px' }}>Mentor Responsável</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>{form.creator.name}</div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.5 }}>{form.creator.bio || 'Especialista certificado Inscreva-se.'}</p>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                    {form.creator.socialLinks?.instagram && <a href={form.creator.socialLinks.instagram} style={{ color: '#fff' }}><Instagram size={18} /></a>}
                                    {form.creator.socialLinks?.linkedin && <a href={form.creator.socialLinks.linkedin} style={{ color: '#fff' }}><Linkedin size={18} /></a>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ticket / QR */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ background: '#fff', borderRadius: '30px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.06)', border: '1px solid #eee', textAlign: 'center' }}
                        >
                            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${window.location.protocol}//${window.location.host}/hub/${id}`}
                                    alt="QR Code Acesso"
                                    style={{ borderRadius: '15px', border: '1px solid #eee' }}
                                />
                            </div>

                            <div style={{ borderTop: '1px dashed #eee', paddingTop: '25px', marginBottom: '25px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '5px' }}>Bilhete Digital</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>ID: #{submission._id.slice(-8).toUpperCase()}</div>
                            </div>

                            <div style={{ display: 'grid', gap: '10px' }}>
                                {form.whatsappConfig?.communityUrl && (
                                    <a
                                        href={form.whatsappConfig.communityUrl}
                                        target="_blank"
                                        style={{
                                            background: '#171A20',
                                            color: '#fff',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <MessageCircle size={20} /> Entrar no Grupo
                                    </a>
                                )}
                                <button style={{ background: '#f4f4f4', color: '#171A20', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Adicionar à Wallet</button>
                                {isApproved && (
                                    <button
                                        onClick={() => {
                                            const dataMap = (submission as any).data || {};
                                            const nameKey = Object.keys(dataMap).find(k =>
                                                k.toLowerCase().includes('nome') ||
                                                k.toLowerCase().includes('name')
                                            );
                                            const participantName = nameKey ? dataMap[nameKey] : "Participante";

                                            generateCertificate({
                                                participantName: String(participantName),
                                                eventTitle: form.title,
                                                date: form.eventDate ? new Date(form.eventDate).toLocaleDateString() : 'A definir',
                                                mentorName: form.creator.name,
                                                id: submission._id
                                            });
                                            toast.success("Certificado gerado com sucesso!");
                                        }}
                                        style={{
                                            background: 'var(--gold-gradient, linear-gradient(135deg, #FFD700 0%, #FDB931 100%))',
                                            color: '#000',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                                        }}
                                    >
                                        <Award size={20} /> BAIXAR CERTIFICADO
                                    </button>
                                )}
                            </div>

                            <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#888', lineHeight: 1.4 }}>Apresente este código na entrada do evento para validar seu acesso.</p>
                        </motion.div>

                        {/* Order Info Mini Card */}
                        <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Info size={14} /> Detalhes da Inscrição
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#5C5E62', display: 'grid', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Status Financial</span>
                                    <span style={{ fontWeight: 700, color: isApproved ? '#10b981' : '#f59e0b' }}>{submission.paymentStatus.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Solicitado em</span>
                                    <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <footer style={{ marginTop: '100px', borderTop: '1px solid #eee', paddingTop: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>© 2026 Inscreva.se Platform. Performance and security guaranteed.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <a href="#" style={{ color: '#171A20', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Suporte</a>
                        <a href="#" style={{ color: '#171A20', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Privacidade</a>
                        <a href="#" style={{ color: '#171A20', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Termos</a>
                    </div>
                </footer>

            </div>

            <style jsx>{`
                @media (max-width: 900px) {
                    .hub-grid {
                        grid-template-columns: 1fr !important;
                    }
                    nav div {
                        justify-content: center !important;
                    }
                    nav button {
                        display: none !important;
                    }
                }
            `}</style>
        </main>
    );
}

export default function ParticipantHub() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
                <Loader2 className="animate-spin" size={40} color="#171A20" />
            </div>
        }>
            <HubContent />
        </Suspense>
    );
}
