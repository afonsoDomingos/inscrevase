"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { adService, AdRequestModel } from '@/lib/adService';
import { Loader2, ChevronLeft, ChevronRight, Zap, ExternalLink, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AnuncioPage({ params }: { params: { id: string } }) {
    const [ad, setAd] = useState<AdRequestModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const data = await adService.getAdById(params.id);
                setAd(data);
                // Also track an impression when the page loads
                await adService.trackAdImpression(params.id).catch(console.error);
            } catch (error) {
                console.error('Error fetching ad:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchAd();
        }
    }, [params.id, router]);

    const handleContactClick = async () => {
        if (ad?._id) {
            await adService.trackAdClick(ad._id).catch(console.error);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#FFD700" />
                </div>
            </div>
        );
    }

    if (!ad) return null;

    const allImages = ad.mediaUrls && ad.mediaUrls.length > 0 ? ad.mediaUrls : [ad.mediaUrl];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%', marginTop: '80px' }}>

                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
                    <ChevronLeft size={18} /> Voltar à página inicial
                </Link>

                <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '0' }}>

                    {/* LEFT SIDE - GALLERY */}
                    <div style={{ position: 'relative', background: '#e2e8f0', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>

                        {/* Status Label */}
                        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'var(--gold-gradient)', color: '#000', padding: '6px 14px', borderRadius: '100px', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                            <Zap size={14} fill="#000" /> Patrocinado
                        </div>

                        {ad.mediaType === 'video' ? (
                            <video
                                src={ad.mediaUrl || ""}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', flex: 1 }}
                                controls
                                autoPlay
                            />
                        ) : (
                            <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: '400px' }}>
                                <Image
                                    src={allImages[currentImageIndex] || '/logo.png'}
                                    alt={ad.title}
                                    fill
                                    style={{ objectFit: 'contain', background: '#f1f5f9' }}
                                />

                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Thumbnails */}
                        {ad.mediaType === 'image' && allImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', padding: '16px', background: '#fff', overflowX: 'auto', borderTop: '1px solid #e2e8f0' }}>
                                {allImages.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: currentImageIndex === idx ? '3px solid #FFD700' : '1px solid #e2e8f0', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                                    >
                                        <Image src={url} alt={`Thumbnail ${idx}`} fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE - INFO */}
                    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#3b82f6', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {ad.category}
                                </span>
                            </div>

                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: '1rem' }}>
                                {ad.title}
                            </h1>

                            {ad.productPrice && (
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(ad.productPrice)}
                                </div>
                            )}

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Sobre
                                </h3>
                                <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                                    {ad.description}
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div style={{ marginTop: 'auto', background: '#fff', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>
                                <ShieldCheck size={18} /> Compra Segura via Contacto Direto
                            </div>

                            <Link
                                href={ad.targetUrl || "#"}
                                onClick={handleContactClick}
                                target={ad.targetUrl && ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '1.2rem',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    fontWeight: 900,
                                    fontSize: '1.15rem',
                                    boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                Contactar Anunciante <ExternalLink size={20} />
                            </Link>

                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', margin: '1rem 0 0 0' }}>
                                Ao contactar, mencione que viu o anúncio no Inscreva-se.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Basic responsive layout injection */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    main > div {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="minHeight: '500px'"] {
                        min-height: 350px !important;
                    }
                }
            `}</style>

            <Footer />
        </div>
    );
}
