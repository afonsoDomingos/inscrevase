/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Phone, FileText, Camera, Save, Loader2, Globe, Instagram, Linkedin, Facebook, Shield } from 'lucide-react';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { formService } from '@/lib/formService'; // For uploading images if admin wants to change user photo
import Image from 'next/image';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onSuccess: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('mentor');
    const [plan, setPlan] = useState('free');
    const [status, setStatus] = useState('active');
    const [businessName, setBusinessName] = useState('');
    const [bio, setBio] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setRole(user.role || 'mentor');
            setPlan(user.plan || 'free');
            setStatus(user.status || 'active');
            setBusinessName(user.businessName || '');
            setBio(user.bio || '');
            setWhatsapp(user.whatsapp || '');
            setProfilePhoto(user.profilePhoto || '');
            setSocialLinks(user.socialLinks || {});
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const url = await formService.uploadFile(e.target.files[0], 'profiles');
                setProfilePhoto(url);
            } catch (err) {
                console.error(err);
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
            await userService.updateUser(user.id || user._id || '', {
                name,
                role: role as UserData['role'],
                plan: plan as UserData['plan'],
                status: status as UserData['status'],
                businessName,
                bio,
                whatsapp,
                profilePhoto,
                socialLinks
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || 'Erro ao atualizar usuário');
        } finally {
            setLoading(false);
        }
    };

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
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        background: '#fff',
                        borderRadius: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden', // Contain children
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '2rem 2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                        <button
                            onClick={onClose}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8f9fa', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={18} />
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Editar Usuário</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Gerencie as informações de {user.name}</p>
                        </div>
                    </div>

                    {/* Form Layout */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

                        {/* Scrollable Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

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

                            {/* Admin Settings Section */}
                            <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Shield size={14} /> Configurações Administrativas
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Função</label>
                                        <select
                                            className="input-luxury"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            style={{ padding: '0.6rem' }}
                                        >
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Admin</option>
                                            <option value="SuperAdmin">SuperAdmin</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Plano</label>
                                        <select
                                            className="input-luxury"
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            style={{ padding: '0.6rem' }}
                                        >
                                            <option value="free">Grátis</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Status</label>
                                        <select
                                            className="input-luxury"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            style={{ padding: '0.6rem' }}
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="blocked">Bloqueado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                    <User size={14} /> Nome Completo
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
                                />
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                    <Phone size={14} /> WhatsApp Corporativo
                                </label>
                                <input
                                    type="text"
                                    className="input-luxury"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                />
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
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            {/* Social Links Section */}
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Globe size={14} /> Redes Sociais
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
                                                placeholder="Instagram"
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
                                                placeholder="LinkedIn"
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
                                                placeholder="Facebook"
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
                                                placeholder="Website"
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Sticky Button) */}
                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', background: '#fff', flexShrink: 0 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ padding: '1rem', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
