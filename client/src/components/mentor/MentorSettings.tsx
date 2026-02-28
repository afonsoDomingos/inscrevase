/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { UserData, authService } from '@/lib/authService';
import { formService } from '@/lib/formService';
import { stripeService } from '@/lib/stripeService';
import { User, Briefcase, Phone, FileText, Globe, Instagram, Linkedin, Facebook, Save, Camera, Loader2, Mail, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { toast } from 'sonner';
import PremiumBadge from '../common/PremiumBadge';

interface MentorSettingsProps {
    user: UserData;
    onUpdate: () => void;
}

export default function MentorSettings({ user, onUpdate }: MentorSettingsProps) {
    const { t } = useTranslate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        bio: '',
        whatsapp: '',
        profilePhoto: '',
        socialLinks: {
            instagram: '',
            linkedin: '',
            facebook: '',
            website: ''
        },
        paypalEmail: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                businessName: user.businessName || '',
                bio: user.bio || '',
                whatsapp: user.whatsapp || '',
                profilePhoto: user.profilePhoto || '',
                socialLinks: {
                    instagram: user.socialLinks?.instagram || '',
                    linkedin: user.socialLinks?.linkedin || '',
                    facebook: user.socialLinks?.facebook || '',
                    website: user.socialLinks?.website || ''
                },
                paypalEmail: user.paypalEmail || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'profiles');
                setFormData(prev => ({ ...prev, profilePhoto: url }));
            } catch (err) {
                console.error("Profile image upload error:", err);
                toast.error(t('events.profile.uploadError'));
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.updateProfile({
                name: formData.name,
                businessName: formData.businessName,
                bio: formData.bio,
                whatsapp: formData.whatsapp,
                profilePhoto: formData.profilePhoto,
                socialLinks: formData.socialLinks,
                paypalEmail: formData.paypalEmail
            });
            onUpdate();
            toast.success(t('dashboard.settings.updateSuccess'));
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error(t('dashboard.settings.updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async () => {
        if (confirm('Deseja solicitar o selo de verificação oficial? Isso sinaliza aos administradores que sua conta é autêntica.')) {
            try {
                await authService.requestVerification();
                onUpdate(); // Refresh parent
                toast.success('Solicitação enviada! Aguarde a análise.');
            } catch (err) {
                console.error("Verification request error:", err);
                toast.error('Erro ao solicitar verificação.');
            }
        }
    };

    const handleDowngrade = async () => {
        if (confirm('Tem certeza que deseja mudar para conta de participante? Você perderá o acesso às ferramentas de mentor.')) {
            setLoading(true);
            try {
                await authService.downgrade();
                toast.success('Sua conta foi alterada para Participante com sucesso.');
                // authService.downgrade refreshes the profile which will trigger the dashboard redirect if the dashboard has a redirect logic
                window.location.reload(); // Simplest way to trigger the dashboard's redirect logic
            } catch (err) {
                console.error("Downgrade error:", err);
                toast.error('Erro ao alterar tipo de conta.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('dashboard.settings.title')}</h2>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {t('events.profile.saveChanges')}</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Profile Card */}
                <div className="luxury-card" style={{ background: '#fff', padding: '2rem', textAlign: 'center', position: 'sticky', top: '2rem' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '4px solid #FFD700', position: 'relative', background: '#f8f9fa' }}>
                            {formData.profilePhoto ? (
                                <Image src={formData.profilePhoto} alt="Profile" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                    <User size={48} />
                                </div>
                            )}
                            {uploading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 className="animate-spin" color="#fff" />
                                </div>
                            )}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: '#000', color: '#FFD700',
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', border: '2px solid #fff',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <Camera size={16} />
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{formData.name || 'Seu Nome'}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{formData.businessName || 'Sua Empresa'}</p>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <PremiumBadge type="mentor" size="sm" />
                        <PremiumBadge type={(user.plan || 'free') as 'free' | 'pro' | 'enterprise'} size="sm" />
                    </div>

                    {/* Verification Status */}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                        {user.isVerified ? (
                            <PremiumBadge type="verified" size="md" />
                        ) : user.verificationStatus === 'pending' ? (
                            <PremiumBadge type="pending" size="md" />
                        ) : user.verificationStatus === 'rejected' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'red', fontWeight: 600 }}>Verificação Recusada</span>
                                <button onClick={handleRequestVerification} style={{ fontSize: '0.8rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                                    Tentar Novamente
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleRequestVerification}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #1877F2',
                                    color: '#1877F2',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(24, 119, 242, 0.1)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#1877F2';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.color = '#1877F2';
                                }}
                            >
                                <PremiumBadge type="verified" size="sm" showLabel={false} /> Solicitar Selo
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.8rem' }}>
                            <User size={18} /> Informações Pessoais
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>Nome Completo</label>
                                <input
                                    type="text" name="name"
                                    value={formData.name} onChange={handleInputChange}
                                    className="input-luxury" style={{ padding: '0.7rem' }}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>Nome da Empresa/Comercial</label>
                                <input
                                    type="text" name="businessName"
                                    value={formData.businessName} onChange={handleInputChange}
                                    className="input-luxury" style={{ padding: '0.7rem' }}
                                    placeholder="Ex: JS Consultoria"
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>E-mail do PayPal (para receber pagamentos)</label>
                            <input
                                type="email" name="paypalEmail"
                                value={formData.paypalEmail} onChange={handleInputChange}
                                className="input-luxury" style={{ padding: '0.7rem' }}
                                placeholder="vendas@exemplo.com"
                            />
                            <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>Este e-mail será usado para direcionar os pagamentos dos seus inscritos via PayPal.</p>
                        </div>

                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>Biografia Curta</label>
                            <textarea
                                name="bio"
                                value={formData.bio} onChange={handleInputChange}
                                className="input-luxury" style={{ padding: '0.7rem', minHeight: '80px', resize: 'none' }}
                                placeholder="Conte um pouco sobre você..."
                            />
                        </div>
                    </div>

                    <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.8rem' }}>
                            <Globe size={18} /> Contato & Redes Sociais
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>WhatsApp</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text" name="whatsapp"
                                        value={formData.whatsapp} onChange={handleInputChange}
                                        className="input-luxury" style={{ paddingLeft: '2.2rem', padding: '0.7rem 0.7rem 0.7rem 2.2rem' }}
                                        placeholder="+258 84..."
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#555' }}>Website</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text" name="social_website"
                                        value={formData.socialLinks.website} onChange={handleInputChange}
                                        className="input-luxury" style={{ paddingLeft: '2.2rem', padding: '0.7rem 0.7rem 0.7rem 2.2rem' }}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <div style={{ position: 'relative' }}>
                                    <Instagram size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text" name="social_instagram"
                                        value={formData.socialLinks.instagram} onChange={handleInputChange}
                                        className="input-luxury" style={{ paddingLeft: '2.2rem', padding: '0.7rem 0.7rem 0.7rem 2.2rem' }}
                                        placeholder="Instagram"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <div style={{ position: 'relative' }}>
                                    <Linkedin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text" name="social_linkedin"
                                        value={formData.socialLinks.linkedin} onChange={handleInputChange}
                                        className="input-luxury" style={{ paddingLeft: '2.2rem', padding: '0.7rem 0.7rem 0.7rem 2.2rem' }}
                                        placeholder="LinkedIn"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <div style={{ position: 'relative' }}>
                                    <Facebook size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text" name="social_facebook"
                                        value={formData.socialLinks.facebook} onChange={handleInputChange}
                                        className="input-luxury" style={{ paddingLeft: '2.2rem', padding: '0.7rem 0.7rem 0.7rem 2.2rem' }}
                                        placeholder="Facebook"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {t('events.profile.saveChanges')}</>}
                            </button>
                        </div>
                    </div>

                    <div style={{
                        position: 'sticky',
                        bottom: '20px',
                        zIndex: 100,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(12px)',
                        padding: '1rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '2rem'
                    }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 3rem', fontSize: '1rem', width: '100%', justifyContent: 'center', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t('events.profile.saveChanges')}</>}
                        </button>
                    </div>

                    {/* Subscription Management */}
                    {user.plan && user.plan !== 'free' && (
                        <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.8rem' }}>
                                <CreditCard size={18} /> Plano e Faturamento
                            </h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Plano {user.plan.toUpperCase()}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                        Gerencie sua assinatura, veja faturas e atualize seu método de pagamento.
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            const { url } = await stripeService.createPortalSession();
                                            window.location.href = url;
                                        } catch (err: any) {
                                            toast.error(err.message || 'Erro ao carregar portal de faturação');
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '0.6rem 1rem', background: '#f8f9fa',
                                        color: '#333', border: '1px solid #ddd',
                                        borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '0.85rem', fontWeight: 700
                                    }}
                                >
                                    Portal Financeiro <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone: Account Type Change */}
                    <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #fee2e2' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', borderBottom: '1px solid #fee2e2', paddingBottom: '0.8rem' }}>
                            <AlertCircle size={18} /> Zona de Perigo
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Mudar para Conta de Participante</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                    Ao voltar a ser participante, você não poderá mais criar eventos e seu plano atual será cancelado.
                                </p>
                            </div>
                            <button
                                onClick={handleDowngrade}
                                disabled={loading}
                                style={{
                                    padding: '0.6rem 1rem',
                                    background: '#fff',
                                    color: '#dc2626',
                                    border: '1px solid #dc2626',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.color = '#dc2626';
                                }}
                            >
                                Alterar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
