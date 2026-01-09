"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Video,
    MessageCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Instagram,
    Linkedin,
    Globe,
    User,
    Loader2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

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
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
            <Loader2 className="animate-spin" size={40} color="#FFD700" />
        </div>
    );

    if (!submission) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
            <h1>Inscrição não encontrada</h1>
            <button onClick={() => router.push('/')} style={{ marginTop: '1rem', color: '#FFD700' }}>Voltar ao início</button>
        </div>
    );

    const { form } = submission;
    const primaryColor = form.theme?.primaryColor || '#FFD700';
    const isApproved = submission.status === 'approved' || submission.paymentStatus === 'paid';

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px', paddingBottom: '100px' }}>

                {/* Header / Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '12px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', color: primaryColor, fontWeight: 800 }}>Hub do Participante</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>Passaporte Digital</div>
                    </div>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '12px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}>
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Status Ticket */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                        borderRadius: '40px',
                        padding: '40px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        marginBottom: '30px'
                    }}
                >
                    {/* Background Glow */}
                    <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: `${primaryColor}15`, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: isApproved ? '#10b981' : '#f59e0b',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            marginBottom: '20px'
                        }}>
                            {isApproved ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            {isApproved ? 'VAGA CONFIRMADA' : 'AGUARDANDO APROVAÇÃO'}
                        </div>

                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>{form.title}</h1>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Calendar size={20} color={primaryColor} style={{ marginBottom: '10px' }} />
                                <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>DATA DO EVENTO</div>
                                <div style={{ fontWeight: 800 }}>{form.eventDate ? new Date(form.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'A definir'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Clock size={20} color={primaryColor} style={{ marginBottom: '10px' }} />
                                <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>HORÁRIO</div>
                                <div style={{ fontWeight: 800 }}>{form.eventDate ? new Date(form.eventDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'A definir'}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Important Links & Actions */}
                <div style={{ display: 'grid', gap: '15px' }}>
                    {form.whatsappConfig?.communityUrl && (
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={form.whatsappConfig.communityUrl}
                            target="_blank"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '24px',
                                background: 'linear-gradient(135deg, #128c7e 0%, #075e54 100%)',
                                borderRadius: '24px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 800
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <MessageCircle size={32} />
                                <div>
                                    <div style={{ fontSize: '1.2rem' }}>Entrar na Comunidade</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>Acesse o grupo exclusivo no WhatsApp</div>
                                </div>
                            </div>
                        </motion.a>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {form.onlineLink && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Video size={24} color={primaryColor} style={{ marginBottom: '15px' }} />
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '5px' }}>Link da Reunião</div>
                                <a href={form.onlineLink} target="_blank" style={{ fontSize: '0.8rem', color: primaryColor, textDecoration: 'none' }}>Acessar agora</a>
                            </div>
                        )}
                        {form.location && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <MapPin size={24} color={primaryColor} style={{ marginBottom: '15px' }} />
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '5px' }}>Localização</div>
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{form.location}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mentor Section */}
                <div style={{ marginTop: '50px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} color={primaryColor} /> Seu Mentor
                    </h3>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                            <Image
                                src={form.creator.profilePhoto || '/default-avatar.png'}
                                alt={form.creator.name}
                                fill
                                style={{ borderRadius: '20px', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{form.creator.name}</div>
                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '5px', lineHeight: 1.5 }}>{form.creator.bio || 'Mentor oficial do Inscreva-se'}</p>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                {form.creator.socialLinks?.instagram && <a href={form.creator.socialLinks.instagram} style={{ color: '#fff' }}><Instagram size={18} /></a>}
                                {form.creator.socialLinks?.linkedin && <a href={form.creator.socialLinks.linkedin} style={{ color: '#fff' }}><Linkedin size={18} /></a>}
                                {form.creator.socialLinks?.website && <a href={form.creator.socialLinks.website} style={{ color: '#fff' }}><Globe size={18} /></a>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Security */}
                <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <ShieldCheck size={14} />
                        Inscrição segura processada por Inscreva.se
                    </div>
                </div>

            </div>
        </main>
    );
}

export default function ParticipantHub() {
    return (
        <Suspense fallback={<div>Carregando hub...</div>}>
            <HubContent />
        </Suspense>
    );
}
