"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Info, Loader2, Facebook, Instagram, Linkedin, Youtube, Music2 } from 'lucide-react';
import { toast } from 'sonner';
import { marketingService } from '@/lib/marketingService';

interface MarketingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceType: 'boost_social' | 'meta_ads' | 'gestion_360';
    serviceName: string;
    onSuccess: () => void;
}

export default function MarketingRequestModal({ isOpen, onClose, serviceType, serviceName, onSuccess }: MarketingRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        contactName: '',
        whatsapp: '',
        email: '',
        companyName: '',
        details: '',
        eventType: 'online' as 'online' | 'presencial' | 'hibrido',
        socialLinks: {} as Record<string, string>,
        otherSocial: ''
    });

    const socialPlatforms = [
        { id: 'facebook', name: 'Facebook', icon: <Facebook size={16} /> },
        { id: 'instagram', name: 'Instagram', icon: <Instagram size={16} /> },
        { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={16} /> },
        { id: 'youtube', name: 'YouTube', icon: <Youtube size={16} /> },
        { id: 'tiktok', name: 'TikTok', icon: <Music2 size={16} /> },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.contactName || !formData.whatsapp || !formData.email || !formData.details) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const finalSocialLinks = { ...formData.socialLinks };
            if (formData.otherSocial) {
                finalSocialLinks['other'] = formData.otherSocial;
            }

            await marketingService.createRequest({
                ...formData,
                socialLinks: finalSocialLinks,
                serviceType
            });
            toast.success('Pedido enviado com sucesso! Entraremos em contacto em breve.');
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || 'Erro ao enviar pedido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px',
                            background: 'var(--paper)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,215,0,0.1)'
                        }}
                    >
                        <div style={{ padding: '1.5rem', background: 'var(--gold-gradient)', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Contratar {serviceName}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>Preencha os dados abaixo para darmos início.</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                        Nome Completo *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            required
                                            value={formData.contactName}
                                            onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                            placeholder="Ex: João Silva"
                                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                        Nome da Empresa (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="Se aplicável"
                                        style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                        WhatsApp *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        placeholder="+244 ..."
                                        style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                        Email de Contacto *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="seu@email.com"
                                        style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                    Tipo de Evento *
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['online', 'presencial', 'hibrido'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, eventType: type as 'online' | 'presencial' | 'hibrido' })}
                                            style={{
                                                flex: 1,
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: formData.eventType === type ? '2px solid #D4AF37' : '1px solid #eee',
                                                background: formData.eventType === type ? 'rgba(212,175,55,0.05)' : '#f8f9fa',
                                                color: formData.eventType === type ? '#D4AF37' : '#666',
                                                fontWeight: 800,
                                                textTransform: 'capitalize',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                    Canais de Comunicação & Links das Redes Sociais
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                                    {socialPlatforms.map((platform) => (
                                        <div key={platform.id} style={{ width: '100%', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                                                <div style={{ color: '#D4AF37' }}>{platform.icon}</div>
                                                <input
                                                    type="url"
                                                    placeholder={`Link do ${platform.name}`}
                                                    value={formData.socialLinks[platform.id] || ''}
                                                    onChange={(e) => {
                                                        const newLinks = { ...formData.socialLinks };
                                                        newLinks[platform.id] = e.target.value;
                                                        setFormData({ ...formData, socialLinks: newLinks });
                                                    }}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.85rem', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <div style={{ color: '#D4AF37' }}><Info size={16} /></div>
                                            <input
                                                type="text"
                                                placeholder="Outra rede social (Ex: Pinterest, WhatsApp Link)"
                                                value={formData.otherSocial}
                                                onChange={(e) => setFormData({ ...formData, otherSocial: e.target.value })}
                                                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.85rem', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                    Detalhes do Evento ou Objectivos *
                                </label>
                                <textarea
                                    required
                                    value={formData.details}
                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Conte-nos um pouco sobre o que pretende alcançar (Ex: Quantidade de inscritos, público-alvo, etc.)"
                                    rows={4}
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Preço do Serviço:</span>
                                <span style={{ color: '#FFD700', fontSize: '1.1rem', fontWeight: 900 }}>Sob Consulta</span>
                            </div>

                            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <Info size={16} color="#D4AF37" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>
                                    Ao enviar este pedido, a nossa equipa de consultores irá analisar o seu perfil e o serviço solicitado. Entraremos em contacto pelas vias fornecidas num prazo de 24h a 48h.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 20px rgba(212,175,55,0.2)'
                                }}
                            >
                                {loading ? (
                                    <> <Loader2 size={20} className="animate-spin" /> Processando... </>
                                ) : (
                                    <> <Send size={20} /> Enviar Pedido de Consultoria </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
