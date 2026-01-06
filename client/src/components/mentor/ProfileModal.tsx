/* eslint-disable */
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Phone, FileText, Camera, Save, Loader2, Link as LinkIcon, Globe, Instagram, Linkedin, Facebook } from 'lucide-react';
import { authService, UserData } from '@/lib/authService';
import { formService } from '@/lib/formService';
import Image from 'next/image';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData;
    onSuccess: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onSuccess }: ProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState(user.name || '');
    const [businessName, setBusinessName] = useState(user.businessName || '');
    const [bio, setBio] = useState(user.bio || '');
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
    const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
    const [socialLinks, setSocialLinks] = useState(user.socialLinks || {});

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'profiles');
                setProfilePhoto(url);
            } catch (err) {
                alert('Erro no upload da foto');
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
                name,
                businessName,
                bio,
                whatsapp,
                profilePhoto,
                socialLinks
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '550px',
                        background: '#fff',
                        borderRadius: '30px',
                        padding: '2.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8f9fa', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Meu Perfil Profissional</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Estas informações aparecerão nos seus formulários.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                        {/* Avatar Upload */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', border: '3px solid #FFD700', position: 'relative' }}>
                                    {profilePhoto ? (
                                        <Image src={profilePhoto} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                            <User size={40} />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Loader2 className="animate-spin" color="#fff" />
                                        </div>
                                    )}
                                </div>
                                <label style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', cursor: 'pointer', border: '2px solid #fff' }}>
                                    <Camera size={16} />
                                    <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                <User size={14} /> Seu Nome Completo
                            </label>
                            <input
                                type="text"
                                className="input-luxury"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                <Briefcase size={14} /> Nome do Negócio/Marca
                            </label>
                            <input
                                type="text"
                                className="input-luxury"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Ex: Master Mentoria"
                            />
                        </div>

                        {/* Social Links Section */}
                        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Globe size={14} /> Redes Sociais (Opcional)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                <div className="input-group">
                                    <div style={{ position: 'relative' }}>
                                        <Instagram size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
                                        <input
                                            type="text"
                                            className="input-luxury"
                                            value={socialLinks.instagram || ''}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                            placeholder="Instagram URL"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div style={{ position: 'relative' }}>
                                        <Linkedin size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
                                        <input
                                            type="text"
                                            className="input-luxury"
                                            value={socialLinks.linkedin || ''}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                            placeholder="LinkedIn URL"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div style={{ position: 'relative' }}>
                                        <Facebook size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
                                        <input
                                            type="text"
                                            className="input-luxury"
                                            value={socialLinks.facebook || ''}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                            placeholder="Facebook URL"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div style={{ position: 'relative' }}>
                                        <Globe size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
                                        <input
                                            type="text"
                                            className="input-luxury"
                                            value={socialLinks.website || ''}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                                            placeholder="Website Pessoal"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                    <Phone size={14} /> WhatsApp Corporativo
                                </label>
                                <input
                                    type="text"
                                    className="input-luxury"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="2588XXXXXXXX"
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                    <LinkIcon size={14} /> Status da Conta
                                </label>
                                <div style={{ padding: '0.8rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: user.plan === 'premium' ? '#38a169' : '#000' }}>
                                    {user.plan?.toUpperCase()} PLAN
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                <FileText size={14} /> Bio Curta
                            </label>
                            <textarea
                                className="input-luxury"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                placeholder="Uma pequena descrição sobre si..."
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '1rem', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
