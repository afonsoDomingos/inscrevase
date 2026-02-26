"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Facebook, Instagram, Linkedin, Youtube, Music2, ArrowRight } from 'lucide-react';
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
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

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

        if (currentStep < totalSteps) {
            nextStep();
            return;
        }

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

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.contactName || !formData.whatsapp || !formData.email) {
                toast.error('Por favor, preencha os dados de contacto.');
                return;
            }
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleWhatsAppSupport = () => {
        const message = encodeURIComponent(`Olá! Sou o ${formData.contactName || 'um Mentor'} e gostaria de tirar algumas dúvidas sobre o ${serviceName}.`);
        window.open(`https://wa.me/244923456789?text=${message}`, '_blank');
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
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ background: '#000', color: '#FFD700', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>PASSO {currentStep} DE {totalSteps}</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{serviceName}</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                                    {currentStep === 1 ? 'Dados para contacto' : currentStep === 2 ? 'Sua presença digital' : 'Detalhes do seu projeto'}
                                </p>
                            </div>
                            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', width: '100%' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                style={{ height: '100%', background: '#D4AF37' }}
                            />
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {currentStep === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                                Nome Completo *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.contactName}
                                                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                                placeholder="Ex: João Silva"
                                                style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}
                                            />
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
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                            Tipo de Evento/Oferta *
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
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                            Redes Sociais
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {socialPlatforms.map((platform) => (
                                                <div key={platform.id} style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '12px', border: formData.socialLinks[platform.id] ? '1px solid #D4AF37' : '1px solid #eee' }}>
                                                        <div style={{ color: formData.socialLinks[platform.id] ? '#D4AF37' : '#888' }}>{platform.icon}</div>
                                                        <input
                                                            type="url"
                                                            placeholder={`Link do ${platform.name}`}
                                                            value={formData.socialLinks[platform.id] || ''}
                                                            onChange={(e) => {
                                                                const newLinks = { ...formData.socialLinks };
                                                                newLinks[platform.id] = e.target.value;
                                                                setFormData({ ...formData, socialLinks: newLinks });
                                                            }}
                                                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.8rem', outline: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#888' }}>
                                            Detalhes do que pretende lançar *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                            placeholder="Descreva o seu curso, workshop ou serviço. Inclua objetivos, público-alvo e qualquer detalhe relevante."
                                            rows={5}
                                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.85rem', resize: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '1rem', borderRadius: '12px' }}>
                                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Investimento:</span>
                                        <span style={{ color: '#FFD700', fontSize: '1rem', fontWeight: 900 }}>Sob Consulta</span>
                                    </div>
                                </motion.div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        Voltar
                                    </button>
                                )}

                                {currentStep < totalSteps ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        style={{ flex: 2, padding: '1rem', background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        Próximo Passo <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{ flex: 2, padding: '1rem', background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Finalizar Pedido'}
                                    </button>
                                )}
                            </div>

                            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                Ainda tem dúvidas?{' '}
                                <button
                                    type="button"
                                    onClick={handleWhatsAppSupport}
                                    style={{ background: 'none', border: 'none', color: '#D4AF37', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Fale agora com um consultor via WhatsApp
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
