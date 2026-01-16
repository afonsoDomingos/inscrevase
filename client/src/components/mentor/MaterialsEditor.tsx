"use client";

import { Plus, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Material {
    name: string;
    url: string;
    type: 'pdf' | 'video' | 'link' | 'zip' | 'other';
    size?: string;
    availableAfterEvent: boolean;
    order: number;
}

interface MaterialsEditorProps {
    materials: Material[];
    onChange: (materials: Material[]) => void;
}

export default function MaterialsEditor({ materials, onChange }: MaterialsEditorProps) {
    const addMaterial = () => {
        onChange([...materials, {
            name: '',
            url: '',
            type: 'pdf',
            size: '',
            availableAfterEvent: false,
            order: materials.length
        }]);
    };

    const removeMaterial = (index: number) => {
        onChange(materials.filter((_, i) => i !== index));
    };

    const updateMaterial = (index: number, key: keyof Material, value: string | boolean | number) => {
        const newMaterials = [...materials];
        newMaterials[index] = { ...newMaterials[index], [key]: value };
        onChange(newMaterials);
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Materiais do Curso</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Adicione slides, vídeos e recursos para download</p>
                </div>
                <button
                    onClick={addMaterial}
                    style={{
                        background: '#000',
                        color: '#FFD700',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <Plus size={16} /> Adicionar Material
                </button>
            </div>

            {materials.length === 0 && (
                <div style={{
                    background: '#f9f9f9',
                    padding: '3rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px dashed #ddd'
                }}>
                    <BookOpen size={32} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhum material adicionado</p>
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>Compartilhe recursos valiosos com seus participantes</p>
                </div>
            )}

            {materials.map((material, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff',
                        padding: '1.2rem',
                        borderRadius: '12px',
                        border: '1px solid #eee'
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px 40px', gap: '1rem', alignItems: 'start' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                Nome do Material
                            </label>
                            <input
                                type="text"
                                value={material.name}
                                onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                                placeholder="Ex: Slides da Apresentação"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                URL do Arquivo
                            </label>
                            <input
                                type="text"
                                value={material.url}
                                onChange={(e) => updateMaterial(index, 'url', e.target.value)}
                                placeholder="https://..."
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                Tipo
                            </label>
                            <select
                                value={material.type}
                                onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    background: '#fff'
                                }}
                            >
                                <option value="pdf">📄 PDF</option>
                                <option value="video">🎥 Vídeo</option>
                                <option value="link">🔗 Link</option>
                                <option value="zip">📦 ZIP</option>
                                <option value="other">📎 Outro</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                Tamanho
                            </label>
                            <input
                                type="text"
                                value={material.size}
                                onChange={(e) => updateMaterial(index, 'size', e.target.value)}
                                placeholder="Ex: 2.5 MB"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => removeMaterial(index)}
                            style={{
                                color: '#e53e3e',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '1.5rem'
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.8rem',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={material.availableAfterEvent}
                            onChange={(e) => updateMaterial(index, 'availableAfterEvent', e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        🔒 Disponível apenas após o evento
                    </label>
                </motion.div>
            ))}
        </div>
    );
}
