/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { UserData, authService } from '@/lib/authService';
import { formService } from '@/lib/formService';
import { User, Briefcase, Phone, FileText, Globe, Instagram, Linkedin, Facebook, Save, Camera, Loader2, Mail } from 'lucide-react';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';

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
        }
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
                }
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
                alert(t('events.profile.uploadError'));
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
                socialLinks: formData.socialLinks
            });
            onUpdate();
            alert(t('dashboard.settings.updateSuccess'));
        } catch (err) {
            alert(t('dashboard.settings.updateError'));
        } finally {
            setLoading(false);
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
                        <div style={{ padding: '4px 12px', background: '#f0f0f0', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>
                            MENTOR
                        </div>
                        <div style={{ padding: '4px 12px', background: 'rgba(255, 215, 0, 0.15)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#B8860B' }}>
                            {user.plan ? user.plan.toUpperCase() : 'FREE'}
                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
