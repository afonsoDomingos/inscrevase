/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Palette, Upload, Image as ImageIcon, Type } from 'lucide-react';
import { formService, FormModel } from '@/lib/formService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';

interface EditEventThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    // We pass the full form object, not just ID
    form: FormModel;
    onSuccess: () => void;
}

const FONTS = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
];

export default function EditEventThemeModal({ isOpen, onClose, form, onSuccess }: EditEventThemeModalProps) {
    const { t } = useTranslate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initialize with current form settings
    const [theme, setTheme] = useState({
        primaryColor: '#FFD700',
        style: 'luxury',
        backgroundColor: '#050505',
        fontFamily: 'Inter'
    });

    const [coverImage, setCoverImage] = useState<string>('');
    const [logo, setLogo] = useState<string>('');

    useEffect(() => {
        if (form) {
            if (form.theme) {
                setTheme({
                    primaryColor: form.theme.primaryColor || '#FFD700',
                    style: form.theme.style || 'luxury',
                    backgroundColor: form.theme.backgroundColor || (form.theme.style === 'minimalist' ? '#FFFFFF' : '#050505'),
                    fontFamily: form.theme.fontFamily || 'Inter'
                });
            }
            setCoverImage(form.coverImage || '');
            setLogo(form.logo || '');
        }
    }, [form]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo') => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const file = e.target.files[0];
                const url = await formService.uploadFile(file, type === 'cover' ? 'covers' : 'logos');

                if (type === 'cover') setCoverImage(url);
                else setLogo(url);

            } catch (error) {
                console.error("Upload failed", error);
                alert(t('events.theme.uploadFailed'));
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await formService.updateForm(form._id, {
                coverImage,
                logo,
                theme: {
                    ...theme,
                    style: theme.style as "luxury" | "minimalist"
                }
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || t('events.theme.updateError'));
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
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: '#fff',
                        borderRadius: '30px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: '#f8f9fa', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: '#FFD70020', borderRadius: '50%', color: '#B8860B', marginBottom: '1rem' }}>
                            <Palette size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('events.theme.title')}</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('events.theme.subtitle')}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Section: Images */}
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={18} /> {t('events.theme.eventImages')}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {/* Cover Image */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>{t('events.theme.coverLabel')}</label>
                                        <div style={{
                                            position: 'relative',
                                            height: '120px',
                                            border: '2px dashed #ddd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}>
                                            {coverImage ? (
                                                <>
                                                    <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-overlay">
                                                        <Upload color="#fff" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#999' }}>
                                                    <Upload size={24} style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.7rem' }}>{t('events.theme.uploadCover')}</div>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>{t('events.theme.logoLabel')}</label>
                                        <div style={{
                                            position: 'relative',
                                            height: '120px',
                                            border: '2px dashed #ddd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}>
                                            {logo ? (
                                                <>
                                                    <Image src={logo} alt="Preview Logo" width={80} height={80} style={{ objectFit: 'contain' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-overlay">
                                                        <Upload color="#fff" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#999' }}>
                                                    <Upload size={24} style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.7rem' }}>{t('events.theme.uploadLogo')}</div>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

                            {/* Section: Colors */}
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Palette size={18} /> {t('events.theme.colorsAndStyle')}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.primaryColor')}</label>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {['#FFD700', '#3182ce', '#38a169', '#e53e3e', '#805ad5', '#d69e2e'].map((color) => (
                                                <motion.button
                                                    key={color}
                                                    onClick={() => setTheme({ ...theme, primaryColor: color })}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: color,
                                                        border: theme.primaryColor === color ? '3px solid #000' : '3px solid transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                />
                                            ))}
                                            <input
                                                type="color"
                                                value={theme.primaryColor}
                                                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                                style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.backgroundColor')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="color"
                                                value={theme.backgroundColor}
                                                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>{theme.backgroundColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

                            {/* Section: Typography */}
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Type size={18} /> {t('events.theme.typography')}
                                </h3>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>{t('events.theme.fontLabel')}</label>
                                    <select
                                        value={theme.fontFamily}
                                        onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                    >
                                        {FONTS.map(font => (
                                            <option key={font.value} value={font.value}>{font.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </section>

                        </div>

                        {/* Live Preview */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('events.preview')}</label>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>{t('events.theme.previewLayout')}</div>
                            </div>

                            <div style={{
                                background: theme.backgroundColor,
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                border: `1px solid ${theme.style === 'luxury' ? 'rgba(255,255,255,0.1)' : '#eee'}`,
                                color: theme.style === 'luxury' ? '#fff' : '#000',
                                fontFamily: theme.fontFamily,
                                minHeight: '400px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {coverImage && (
                                    <div style={{ position: 'relative', height: '120px', width: '100%' }}>
                                        <Image src={coverImage} alt="Preview Cover" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {logo && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <Image src={logo} alt="Preview Logo" width={50} height={50} style={{ objectFit: 'contain' }} />
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: theme.primaryColor, fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {t('events.registrationsOpen')}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
                                        {form.title}
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>
                                        {form.description ? form.description.substring(0, 80) + '...' : t('events.descriptionPlaceholder')}
                                    </p>

                                    <div style={{ marginTop: 'auto' }}>
                                        <button style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: theme.primaryColor,
                                            color: theme.style === 'luxury' ? '#000' : '#fff',
                                            border: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            fontFamily: theme.fontFamily
                                        }}>
                                            {t('events.registerNow')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || uploading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loading || uploading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {t('events.profile.saveChanges')}</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
