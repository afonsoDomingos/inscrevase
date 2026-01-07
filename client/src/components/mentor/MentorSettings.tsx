/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { UserData, authService } from '@/lib/authService';
import { formService } from '@/lib/formService';
import { User, Briefcase, Phone, FileText, Globe, Instagram, Linkedin, Facebook, Save, Camera, Loader2 } from 'lucide-react';
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
        <div className="luxury-card" style={{ background: '#fff', border: 'none', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>{t('dashboard.settings.title')}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>

                {/* Profile Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '4px solid #FFD700', position: 'relative', background: '#f0f0f0' }}>
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
                            cursor: 'pointer', border: '2px solid #fff'
                        }}>
                            <Camera size={18} />
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('dashboard.settings.photoHelp')}</p>
                </div>

                {/* Personal Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.profile.fullName')}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text" name="name"
                                value={formData.name} onChange={handleInputChange}
                                className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.profile.businessName')}</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text" name="businessName"
                                value={formData.businessName} onChange={handleInputChange}
                                className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.profile.bio')}</label>
                    <div style={{ position: 'relative' }}>
                        <FileText size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#999' }} />
                        <textarea
                            name="bio"
                            value={formData.bio} onChange={handleInputChange}
                            className="input-luxury" style={{ paddingLeft: '2.5rem', minHeight: '100px', resize: 'vertical' }}
                            placeholder={t('dashboard.settings.bioPlaceholder')}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('events.profile.whatsapp')}</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text" name="whatsapp"
                            value={formData.whatsapp} onChange={handleInputChange}
                            className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                            placeholder={t('dashboard.settings.whatsappPlaceholder')}
                        />
                    </div>
                </div>

                {/* Social Links */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={18} color="#FFD700" /> {t('events.profile.socialLinks')}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <div style={{ position: 'relative' }}>
                                <Instagram size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text" name="social_instagram"
                                    value={formData.socialLinks.instagram} onChange={handleInputChange}
                                    className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                                    placeholder={t('dashboard.settings.instagramPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <div style={{ position: 'relative' }}>
                                <Linkedin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text" name="social_linkedin"
                                    value={formData.socialLinks.linkedin} onChange={handleInputChange}
                                    className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                                    placeholder={t('dashboard.settings.linkedinPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <div style={{ position: 'relative' }}>
                                <Facebook size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text" name="social_facebook"
                                    value={formData.socialLinks.facebook} onChange={handleInputChange}
                                    className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                                    placeholder={t('dashboard.settings.facebookPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text" name="social_website"
                                    value={formData.socialLinks.website} onChange={handleInputChange}
                                    className="input-luxury" style={{ paddingLeft: '2.5rem' }}
                                    placeholder={t('dashboard.settings.websitePlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {t('events.profile.saveChanges')}</>}
                </button>
            </form>
        </div>
    );
}
