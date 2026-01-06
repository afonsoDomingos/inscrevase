"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Palette } from 'lucide-react';
import { formService, FormModel } from '@/lib/formService';

interface EditEventThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    // We pass the full form object, not just ID
    form: FormModel;
    onSuccess: () => void;
}

export default function EditEventThemeModal({ isOpen, onClose, form, onSuccess }: EditEventThemeModalProps) {
    const [loading, setLoading] = useState(false);

    // Initialize with current form settings
    const [theme, setTheme] = useState({
        primaryColor: '#FFD700',
        style: 'luxury',
        backgroundColor: '#050505',
        fontFamily: 'Inter'
    });

    useEffect(() => {
        if (form && form.theme) {
            setTheme({
                primaryColor: form.theme.primaryColor || '#FFD700',
                style: form.theme.style || 'luxury',
                backgroundColor: form.theme.backgroundColor || (form.theme.style === 'minimalist' ? '#FFFFFF' : '#050505'),
                fontFamily: form.theme.fontFamily || 'Inter'
            });
        }
    }, [form]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // We update the form. Since backend expects data to update.
            // formService updateForm is generic? We might need to implement updateForm in service if not exists, 
            // or we use a general update method. Assuming toggleFormStatus exists, we might need a general update.
            // Let's check formService first. If simple update doesn't exist, we might need to add it.
            // For now, let's assume we can update just theme via a new endpoint or existing one.
            // Actually, best to use updateForm if we had one. Let's create `updateForm` in service.

            await formService.updateForm(form._id, {
                theme: {
                    ...theme,
                    style: theme.style as "luxury" | "minimalist"
                }
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Erro ao atualizar tema');
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
                        maxWidth: '900px',
                        background: '#fff',
                        borderRadius: '30px',
                        padding: '2rem',
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
                        <div style={{ display: 'inline-flex', padding: '1rem', background: '#FFD70020', borderRadius: '50%', color: '#B8860B', marginBottom: '1rem' }}>
                            <Palette size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Personalizar Tema</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Edite as cores de "{form.title}"</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Cor Principal</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Cor de Fundo</label>
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

                        {/* Live Preview */}
                        <div style={{
                            background: theme.backgroundColor,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            border: `1px solid ${theme.style === 'luxury' ? 'rgba(255,255,255,0.1)' : '#eee'}`,
                            color: theme.style === 'luxury' ? '#fff' : '#000',
                            marginTop: '0'
                        }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: theme.primaryColor, fontWeight: 700, marginBottom: '0.5rem' }}>
                                Pré-visualização
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
                                {form.title}
                            </h3>
                            <button style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.primaryColor}dd)`,
                                color: '#000',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                            }}>
                                Inscrever-se Agora
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Estilo Base</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div
                                onClick={() => setTheme({ ...theme, style: 'luxury', backgroundColor: '#050505' })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: theme.style === 'luxury' ? '2px solid #FFD700' : '1px solid #ddd',
                                    background: '#000',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>Luxo</div>
                            </div>
                            <div
                                onClick={() => setTheme({ ...theme, style: 'minimalist', backgroundColor: '#FFFFFF' })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: theme.style === 'minimalist' ? '2px solid #3182ce' : '1px solid #ddd',
                                    background: '#fff',
                                    color: '#000',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>Minimalista</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
