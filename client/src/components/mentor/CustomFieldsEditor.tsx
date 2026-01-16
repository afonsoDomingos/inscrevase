"use client";

import { Plus, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomField {
    label: string;
    value: string;
    icon?: string;
    order: number;
}

interface CustomFieldsEditorProps {
    fields: CustomField[];
    onChange: (fields: CustomField[]) => void;
}

export default function CustomFieldsEditor({ fields, onChange }: CustomFieldsEditorProps) {
    const addField = () => {
        onChange([...fields, { label: '', value: '', order: fields.length }]);
    };

    const removeField = (index: number) => {
        onChange(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: keyof CustomField, value: string | number) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        onChange(newFields);
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Campos Customizados</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Adicione informações importantes que aparecerão no Hub</p>
                </div>
                <button
                    onClick={addField}
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
                    <Plus size={16} /> Adicionar Campo
                </button>
            </div>

            {fields.length === 0 && (
                <div style={{
                    background: '#f9f9f9',
                    padding: '3rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px dashed #ddd'
                }}>
                    <Info size={32} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhum campo customizado ainda</p>
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>Adicione códigos de acesso, links ou instruções especiais</p>
                </div>
            )}

            {fields.map((field, index) => (
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 40px', gap: '1rem', alignItems: 'start' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                Label
                            </label>
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                placeholder="Ex: Código de Acesso"
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
                                Valor
                            </label>
                            <input
                                type="text"
                                value={field.value}
                                onChange={(e) => updateField(index, 'value', e.target.value)}
                                placeholder="Ex: ABC123 ou https://drive.google.com/..."
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
                            onClick={() => removeField(index)}
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
                </motion.div>
            ))}
        </div>
    );
}
