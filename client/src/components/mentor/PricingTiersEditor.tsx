/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, DollarSign, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PricingTier {
    id: string;
    category: string;
    price: number;
    description?: string;
}

interface PricingTiersEditorProps {
    tiers: PricingTier[];
    currency: string;
    onUpdate: (tiers: PricingTier[]) => void;
}

export default function PricingTiersEditor({ tiers, currency, onUpdate }: PricingTiersEditorProps) {
    const [localTiers, setLocalTiers] = useState<PricingTier[]>(tiers);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile Detection
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkMobile = () => setIsMobile(window.innerWidth <= 640);
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, []);

    // Predefined category suggestions
    const categorySuggestions = [
        { label: 'Público Geral', icon: '👥' },
        { label: 'Estudantes', icon: '🎓' },
        { label: 'Membros/Associados', icon: '⭐' },
        { label: 'Early Bird', icon: '🐦' },
        { label: 'VIP', icon: '💎' },
        { label: 'Grupos (3+)', icon: '👨‍👩‍👧' },
        { label: 'Profissionais', icon: '💼' },
        { label: 'Idosos/Seniors', icon: '👴' },
    ];

    const addTier = () => {
        const newTier: PricingTier = {
            id: Date.now().toString(),
            category: '',
            price: 0,
            description: ''
        };
        const updated = [...localTiers, newTier];
        setLocalTiers(updated);
        onUpdate(updated);
    };

    const removeTier = (id: string) => {
        const updated = localTiers.filter(t => t.id !== id);
        setLocalTiers(updated);
        onUpdate(updated);
        toast.success('Categoria removida');
    };

    const updateTier = (id: string, field: keyof PricingTier, value: string | number) => {
        const updated = localTiers.map(t =>
            t.id === id ? { ...t, [field]: value } : t
        );
        setLocalTiers(updated);
        onUpdate(updated);
    };

    return (
        <div style={{
            background: '#f8f9fa',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={20} color="#FFD700" />
                        Categorias de Preço
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>
                        Ofereça preços diferenciados para diferentes públicos
                    </p>
                </div>
                <button
                    onClick={addTier}
                    style={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    }}
                >
                    <Plus size={16} /> Adicionar Categoria
                </button>
            </div>

            {localTiers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#aaa',
                    border: '2px dashed #ddd',
                    borderRadius: '12px',
                    background: '#fff'
                }}>
                    <Users size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                        Nenhuma categoria de preço definida
                    </p>
                    <p style={{ fontSize: '0.75rem' }}>
                        Clique em "Adicionar Categoria" para criar preços diferenciados
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <AnimatePresence>
                        {localTiers.map((tier, index) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    border: '1px solid #e5e7eb',
                                    position: 'relative'
                                }}
                            >
                                <button
                                    onClick={() => removeTier(tier.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: '#fee2e2',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Trash2 size={14} /> Remover
                                </button>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            marginBottom: '6px',
                                            color: '#555'
                                        }}>
                                            Categoria / Público <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={tier.category}
                                            onChange={(e) => updateTier(tier.id, 'category', e.target.value)}
                                            placeholder="Ex: Estudantes, Público Geral..."
                                            list={`categories-${tier.id}`}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: tier.category ? '1px solid #d1d5db' : '2px solid #fbbf24',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <datalist id={`categories-${tier.id}`}>
                                            {categorySuggestions.map(cat => (
                                                <option key={cat.label} value={cat.label} />
                                            ))}
                                        </datalist>
                                        {!tier.category && (
                                            <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertCircle size={10} /> Campo obrigatório
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            marginBottom: '6px',
                                            color: '#555'
                                        }}>
                                            Preço ({currency}) <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={tier.price}
                                            onChange={(e) => updateTier(tier.id, 'price', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                outline: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        marginBottom: '6px',
                                        color: '#555'
                                    }}>
                                        Descrição / Condições (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={tier.description || ''}
                                        onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                                        placeholder="Ex: Desconto de 50% para estudantes  com carteirinha válida"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db',
                                            outline: 'none',
                                            fontSize: '0.85rem',
                                            color: '#666'
                                        }}
                                    />
                                </div>

                                {/* Suggestion Pills */}
                                {!tier.category && (
                                    <div style={{ marginTop: '12px' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
                                            💡 Sugestões rápidas:
                                        </p>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {categorySuggestions.slice(0, 4).map(cat => (
                                                <button
                                                    key={cat.label}
                                                    onClick={() => updateTier(tier.id, 'category', cat.label)}
                                                    style={{
                                                        background: '#f3f4f6',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#FFD700';
                                                        e.currentTarget.style.color = '#000';
                                                        e.currentTarget.style.fontWeight = '700';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#f3f4f6';
                                                        e.currentTarget.style.color = 'inherit';
                                                        e.currentTarget.style.fontWeight = 'inherit';
                                                    }}
                                                >
                                                    {cat.icon} {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Summary */}
            {localTiers.length > 0 && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                        📊 Resumo de Preços:
                    </h5>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {localTiers.map(tier => (
                            <div key={tier.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ color: '#666' }}>
                                    {tier.category || <span style={{ fontStyle: 'italic', color: '#aaa' }}>Sem nome</span>}
                                </span>
                                <span style={{ fontWeight: 700 }}>
                                    {currency} {tier.price.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
