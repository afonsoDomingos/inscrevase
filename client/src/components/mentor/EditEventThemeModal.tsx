/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Palette, Upload, Image as ImageIcon, Type } from 'lucide-react';
import { formService, FormModel } from '@/lib/formService';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { toast } from 'sonner';

/**
 * Custom CSS for hover effects
 */
const hoverOverlayStyles = `
  .hover-parent:hover .hover-overlay-plus {
    opacity: 1 !important;
  }
`;

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
    const [uploading, setUploading] = useState<string | null>(null); // 'cover', 'logo', 'background' or null

    // Initialize with current form settings
    const [theme, setTheme] = useState({
        primaryColor: '#FFD700',
        style: 'luxury',
        backgroundColor: '#050505',
        backgroundImage: '',
        titleColor: '#FFFFFF',
        inputColor: '#FFFFFF',
        inputBackgroundColor: 'rgba(255,255,255,0.05)',
        inputPlaceholderColor: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter'
    });

    const [coverImage, setCoverImage] = useState<string>('');
    const [logo, setLogo] = useState<string>('');

    const lastFormId = useRef<string | null>(null);

    useEffect(() => {
        if (form && form._id !== lastFormId.current) {
            console.log("Initializing theme modal state for form:", form._id);
            lastFormId.current = form._id;

            if (form.theme) {
                setTheme({
                    primaryColor: form.theme.primaryColor || '#FFD700',
                    style: form.theme.style || 'luxury',
                    backgroundColor: form.theme.backgroundColor || (form.theme.style === 'minimalist' ? '#FFFFFF' : '#050505'),
                    backgroundImage: form.theme.backgroundImage || '',
                    titleColor: form.theme.titleColor || '#FFFFFF',
                    inputColor: form.theme.inputColor || '#FFFFFF',
                    inputBackgroundColor: form.theme.inputBackgroundColor || 'rgba(255,255,255,0.05)',
                    inputPlaceholderColor: form.theme.inputPlaceholderColor || 'rgba(255,255,255,0.4)',
                    fontFamily: form.theme.fontFamily || 'Inter'
                });
            }
            setCoverImage(form.coverImage || '');
            setLogo(form.logo || '');
        }
    }, [form]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo' | 'background') => {
        if (e.target.files && e.target.files[0]) {
            setUploading(type);
            console.log(`Starting upload for ${type}...`);
            try {
                const file = e.target.files[0];
                let folder = 'general';
                if (type === 'cover') folder = 'covers';
                else if (type === 'logo') folder = 'logos';
                else if (type === 'background') folder = 'backgrounds';

                const url = await formService.uploadFile(file, folder);
                console.log(`Upload successful for ${type}: ${url}`);

                if (type === 'cover') setCoverImage(url);
                else if (type === 'logo') setLogo(url);
                else if (type === 'background') setTheme(prev => ({ ...prev, backgroundImage: url }));

                toast.success(t('common.success') || 'Upload concluído');

            } catch (err: unknown) {
                const error = err as Error;
                console.error("Upload failed details:", error);
                toast.error(`${t('events.theme.uploadFailed') || 'Erro no upload'}: ${error.message || 'Erro desconhecido'}`);
            } finally {
                setUploading(null);
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
            toast.success(t('events.theme.updateSuccess') || 'Tema atualizado com sucesso!');
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('events.theme.updateError'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <style>{hoverOverlayStyles}</style>
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
                        maxWidth: '1100px',
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Section: Images */}
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={18} /> {t('events.theme.eventImages')}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                    {/* Cover Image */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>{t('events.theme.coverLabel')}</label>
                                        <div style={{
                                            position: 'relative',
                                            height: '100px',
                                            border: '2px dashed #ddd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }} className="hover-parent">
                                            {uploading === 'cover' ? (
                                                <Loader2 className="animate-spin" color="#FFD700" />
                                            ) : coverImage ? (
                                                <>
                                                    <Image src={coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} className="hover-overlay-plus">
                                                        <Upload color="#fff" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#999' }}>
                                                    <Upload size={20} style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.65rem' }}>{t('events.theme.uploadCover')}</div>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>{t('events.theme.logoLabel')}</label>
                                        <div style={{
                                            position: 'relative',
                                            height: '100px',
                                            border: '2px dashed #ddd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }} className="hover-parent">
                                            {uploading === 'logo' ? (
                                                <Loader2 className="animate-spin" color="#FFD700" />
                                            ) : logo ? (
                                                <>
                                                    <Image src={logo} alt="Preview Logo" fill style={{ objectFit: 'contain' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} className="hover-overlay-plus">
                                                        <Upload color="#fff" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#999' }}>
                                                    <Upload size={20} style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.65rem' }}>{t('events.theme.uploadLogo')}</div>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
                                        </div>
                                    </div>

                                    {/* Background Image */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>Imagem de Fundo (BG)</label>
                                        <div style={{
                                            position: 'relative',
                                            height: '100px',
                                            border: '2px dashed #ddd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            background: theme.backgroundImage ? `url(${theme.backgroundImage}) center/cover` : '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }} className="hover-parent">
                                            {uploading === 'background' ? (
                                                <Loader2 className="animate-spin" color="#FFD700" />
                                            ) : !theme.backgroundImage ? (
                                                <div style={{ textAlign: 'center', color: '#999' }}>
                                                    <ImageIcon size={20} style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.65rem' }}>Upload BG</div>
                                                </div>
                                            ) : (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} className="hover-overlay-plus">
                                                    <Upload color="#fff" />
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
                                            {theme.backgroundImage && !uploading && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setTheme({ ...theme, backgroundImage: '' }); }}
                                                    style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 5px', fontSize: '10px', cursor: 'pointer', zIndex: 5 }}
                                                >Remover</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

                            {/* Section: Colors */}
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Palette size={18} /> Cores e Personalização Avançada
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {/* Cor Principal */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>{t('events.primaryColor')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="color"
                                                value={theme.primaryColor}
                                                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{theme.primaryColor}</span>
                                        </div>
                                    </div>

                                    {/* Cor de Fundo */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>{t('events.backgroundColor')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="color"
                                                value={theme.backgroundColor}
                                                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{theme.backgroundColor}</span>
                                        </div>
                                    </div>

                                    {/* Cor do Título */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>Cor do Título</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="color"
                                                value={theme.titleColor}
                                                onChange={(e) => setTheme({ ...theme, titleColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{theme.titleColor}</span>
                                        </div>
                                    </div>

                                    {/* Cor do Texto do Input */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>Cor do Texto do Input</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="color"
                                                value={theme.inputColor}
                                                onChange={(e) => setTheme({ ...theme, inputColor: e.target.value })}
                                                style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{theme.inputColor}</span>
                                        </div>
                                    </div>

                                    {/* Cor de Fundo do Input */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>Fundo do Input</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={theme.inputBackgroundColor}
                                                onChange={(e) => setTheme({ ...theme, inputBackgroundColor: e.target.value })}
                                                placeholder="rgba(0,0,0,0.1) ou #hex"
                                                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Cor do Placeholder */}
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>Cor do Placeholder</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={theme.inputPlaceholderColor}
                                                onChange={(e) => setTheme({ ...theme, inputPlaceholderColor: e.target.value })}
                                                placeholder="rgba(0,0,0,0.4) ou #hex"
                                                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                            />
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
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.85rem' }}>{t('events.theme.fontLabel')}</label>
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
                        <div style={{ position: 'sticky', top: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('events.preview')}</label>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>{t('events.theme.previewLayout')}</div>
                            </div>

                            <div style={{
                                backgroundColor: theme.backgroundColor,
                                backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                border: `1px solid ${theme.style === 'luxury' ? 'rgba(255,255,255,0.1)' : '#eee'}`,
                                fontFamily: theme.fontFamily,
                                minHeight: '500px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease'
                            }}>
                                {coverImage && (
                                    <div style={{ position: 'relative', height: '140px', width: '100%' }}>
                                        <Image src={coverImage} alt="Preview Cover" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {logo && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <Image src={logo} alt="Preview Logo" width={50} height={50} style={{ objectFit: 'contain' }} />
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', color: theme.primaryColor, fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {t('events.registrationsOpen')}
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, color: theme.titleColor }}>
                                        {form.title}
                                    </h3>

                                    {/* Input Previews */}
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <div style={{
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: theme.inputBackgroundColor,
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: theme.inputPlaceholderColor,
                                            fontSize: '0.75rem'
                                        }}>Seu nome completo...</div>
                                        <div style={{
                                            padding: '0.8rem',
                                            borderRadius: '8px',
                                            background: theme.inputBackgroundColor,
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: theme.inputColor,
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>Exemplo de Texto</div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                                        <button style={{
                                            width: '100%',
                                            padding: '0.9rem',
                                            borderRadius: '10px',
                                            background: theme.primaryColor,
                                            color: theme.backgroundColor, // Auto-contrast for preview
                                            filter: 'brightness(1.1)',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '0.8rem',
                                            fontFamily: theme.fontFamily,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {t('events.registerNow')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !!uploading}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: '15px',
                                opacity: loading || !!uploading ? 0.7 : 1
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {t('events.profile.saveChanges')}</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
