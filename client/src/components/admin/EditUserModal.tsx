/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Phone, FileText, Camera, Save, Loader2, Globe, Instagram, Linkedin, Facebook, Shield, Key, Award } from 'lucide-react';
import { userService } from '@/lib/userService';
import { authService, UserData } from '@/lib/authService';
import { formService } from '@/lib/formService'; // For uploading images if admin wants to change user photo
import Image from 'next/image';
import Tooltip from '../common/Tooltip';
import { useTranslate } from '@/context/LanguageContext';


interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onSuccess: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
    const { t } = useTranslate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('mentor');
    const [plan, setPlan] = useState('free');
    const [status, setStatus] = useState('active');
    const [businessName, setBusinessName] = useState('');
    const [bio, setBio] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [password, setPassword] = useState(''); // New state for password reset
    const [isPublic, setIsPublic] = useState(false);
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
    const [badges, setBadges] = useState<{ name: string; color: string }[]>([]);
    const [canCreateEvents, setCanCreateEvents] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    useEffect(() => {
        const loggedUser = authService.getCurrentUser();
        setCurrentUser(loggedUser);

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setRole(user.role || 'mentor');
            setPlan(user.plan || 'free');
            setStatus(user.status || 'active');
            setBusinessName(user.businessName || '');
            setBio(user.bio || '');
            setWhatsapp(user.whatsapp || '');
            setProfilePhoto(user.profilePhoto || '');
            setPassword(''); // Reset password field
            setIsPublic(user.isPublic || false);
            setSocialLinks(user.socialLinks || {});
            setBadges(user.badges || []);
            setCanCreateEvents(user.canCreateEvents !== false);
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
                alert(t('dashboard.usersList.editModal.messages.uploadError'));
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
                email,
                role: role as UserData['role'],
                plan: plan as UserData['plan'],
                status: status as UserData['status'],
                businessName,
                bio,
                whatsapp,
                profilePhoto,
                socialLinks,
                password, // Include password in update
                isPublic,
                canCreateEvents,
                badges
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || t('dashboard.usersList.editModal.messages.updateError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2vh 1rem', overflowY: 'auto' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '750px',
                        height: 'auto',
                        maxHeight: '85vh',
                        background: '#fff',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        zIndex: 2001
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '2rem 2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                        <Tooltip content={t('common.close')}>
                            <button
                                onClick={onClose}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8f9fa', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </Tooltip>

                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('dashboard.usersList.editModal.title')}</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('dashboard.usersList.editModal.subtitle', { name: user.name })}</p>
                        </div>
                    </div>

                    {/* Form Layout */}
                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        maxHeight: '100%',
                        overflow: 'hidden'
                    }}>

                        {/* Scrollable Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>

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
                                    <Tooltip content={t('dashboard.usersList.editModal.changePhoto')}>
                                        <label style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', cursor: 'pointer', border: '2px solid #fff' }}>
                                            <Camera size={16} />
                                            <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </Tooltip>

                                </div>
                            </div>

                            {/* Admin Settings Section */}
                            <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Shield size={14} /> {t('dashboard.usersList.editModal.adminSettings')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('dashboard.usersList.editModal.role')}</label>
                                        <select
                                            className="input-luxury"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            style={{
                                                padding: '0.6rem',
                                                opacity: (currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'admin' && user.role !== 'admin' && user.role !== 'SuperAdmin')) ? 1 : 0.6,
                                                cursor: (currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'admin' && user.role !== 'admin' && user.role !== 'SuperAdmin')) ? 'pointer' : 'not-allowed'
                                            }}
                                            disabled={!(currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'admin' && user.role !== 'admin' && user.role !== 'SuperAdmin'))}
                                        >
                                            <option value="mentor">Mentor</option>
                                            <option value="specialist">Especialista</option>
                                            <option value="company">Empresa</option>
                                            <option value="participant">Participante</option>
                                            {(currentUser?.role === 'SuperAdmin' || role === 'admin') && <option value="admin">Admin</option>}
                                            {(currentUser?.role === 'SuperAdmin' || role === 'SuperAdmin') && <option value="SuperAdmin">SuperAdmin</option>}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('dashboard.usersList.editModal.plan')}</label>
                                        <select
                                            className="input-luxury"
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            style={{ padding: '0.6rem' }}
                                        >
                                            <option value="free">Grátis</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('dashboard.usersList.editModal.status')}</label>
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

                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#e6fffa', padding: '0.8rem', borderRadius: '8px', border: '1px solid #b2f5ea' }}>
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="isPublic" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2c7a7b', cursor: 'pointer' }}>
                                            {t('dashboard.usersList.editModal.isPublic')}
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: canCreateEvents ? '#f0fff4' : '#fff5f5', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${canCreateEvents ? '#c6f6d5' : '#fed7d7'}` }}>
                                        <input
                                            type="checkbox"
                                            id="canCreateEvents"
                                            checked={canCreateEvents}
                                            onChange={(e) => setCanCreateEvents(e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="canCreateEvents" style={{ fontSize: '0.85rem', fontWeight: 700, color: canCreateEvents ? '#2f855a' : '#c53030', cursor: 'pointer' }}>
                                            {t('dashboard.usersList.editModal.canCreateEvents')}
                                        </label>
                                    </div>
                                </div>

                                {/* Badges Management */}
                                <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Award size={14} /> {t('dashboard.usersList.editModal.badgesTitle')}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                                        {['Especialista', 'Top Mentor', 'Verificado', 'Elite'].map(badgeName => {
                                            const isActive = badges.some(b => b.name === badgeName);
                                            return (
                                                <button
                                                    key={badgeName}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isActive) {
                                                            setBadges(badges.filter(b => b.name !== badgeName));
                                                        } else {
                                                            setBadges([...badges, { name: badgeName, color: badgeName === 'Elite' ? '#FFD700' : '#4299e1' }]);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '100px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        background: isActive ? (badgeName === 'Elite' ? 'var(--gold-gradient)' : '#4299e1') : '#fff',
                                                        color: isActive ? '#000' : '#666',
                                                        border: isActive ? 'none' : '1px solid #ddd',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {badgeName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                        <User size={14} /> {t('dashboard.usersList.editModal.fullName')}
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
                                        <Globe size={14} /> {t('dashboard.usersList.editModal.email')}
                                    </label>
                                    <input
                                        type="email"
                                        className="input-luxury"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                        <Briefcase size={14} /> {t('dashboard.usersList.editModal.businessName')}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Ex: Consultoria X"
                                    />
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                        <Phone size={14} /> {t('dashboard.usersList.editModal.whatsapp')}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="+258 84 123 4567"
                                    />
                                </div>

                                <div className="input-group" style={{ gridColumn: 'span 1' }}> {/* On large screens could span 2, but 3 items... logic checks out for auto-fit */}
                                    {/* Actually bio usually spans full width */}
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
                                    <FileText size={14} /> {t('dashboard.usersList.editModal.bio')}
                                </label>
                                <textarea
                                    className="input-luxury"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            {/* Security Section */}
                            <div style={{ background: '#fff5f5', padding: '1rem', borderRadius: '12px', border: '1px solid #fed7d7' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Key size={14} /> {t('dashboard.usersList.editModal.securityTitle')}
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: '#c53030' }}>{t('dashboard.usersList.editModal.newPassword')}</label>
                                    <input
                                        type="text"
                                        className="input-luxury"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Digite para redefinir..."
                                        style={{ borderColor: '#fed7d7' }}
                                        autoComplete="new-password"
                                    />
                                    <p style={{ fontSize: '0.7rem', color: '#e53e3e', marginTop: '4px' }}>{t('dashboard.usersList.editModal.passwordHint')}</p>
                                </div>
                            </div>

                            {/* Social Links Section */}
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Globe size={14} /> {t('dashboard.usersList.editModal.socialLinks')}
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
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #eee',
                            background: '#fcfcfc',
                            flexShrink: 0,
                            boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
                            display: 'flex',
                            gap: '0.8rem',
                            zIndex: 10
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '0.7rem 1.2rem',
                                    borderRadius: '10px',
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    color: '#666',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    padding: '0.8rem',
                                    flex: 1,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    fontWeight: 800,
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {t('dashboard.usersList.editModal.saveChanges')}</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
