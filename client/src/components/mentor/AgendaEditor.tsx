"use client";

import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgendaItem {
    time: string;
    activity: string;
    description?: string;
    duration?: string;
    order: number;
}

interface AgendaEditorProps {
    agenda: AgendaItem[];
    onChange: (agenda: AgendaItem[]) => void;
}

export default function AgendaEditor({ agenda, onChange }: AgendaEditorProps) {
    const addItem = () => {
        onChange([...agenda, {
            time: '',
            activity: '',
            description: '',
            duration: '',
            order: agenda.length
        }]);
    };

    const removeItem = (index: number) => {
        onChange(agenda.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, key: keyof AgendaItem, value: string | number) => {
        const newAgenda = [...agenda];
        newAgenda[index] = { ...newAgenda[index], [key]: value };
        onChange(newAgenda);
    };

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Programação do Evento</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Defina a agenda completa das atividades</p>
                </div>
                <button
                    onClick={addItem}
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
                    <Plus size={16} /> Adicionar Atividade
                </button>
            </div>

            {agenda.length === 0 && (
                <div style={{
                    background: '#f9f9f9',
                    padding: '3rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px dashed #ddd'
                }}>
                    <Calendar size={32} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhuma atividade agendada</p>
                    <p style={{ color: '#999', fontSize: '0.8rem' }}>Crie uma timeline visual para seus participantes</p>
                </div>
            )}

            {agenda.map((item, index) => (
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
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 40px', gap: '1rem', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Horário
                            </label>
                            <input
                                type="time"
                                value={item.time}
                                onChange={(e) => updateItem(index, 'time', e.target.value)}
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
                                Atividade
                            </label>
                            <input
                                type="text"
                                value={item.activity}
                                onChange={(e) => updateItem(index, 'activity', e.target.value)}
                                placeholder="Ex: Abertura do Evento"
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
                                Duração
                            </label>
                            <input
                                type="text"
                                value={item.duration}
                                onChange={(e) => updateItem(index, 'duration', e.target.value)}
                                placeholder="Ex: 30 min"
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
                            onClick={() => removeItem(index)}
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
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: '#666' }}>
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Detalhes sobre esta atividade..."
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                outline: 'none',
                                fontSize: '0.85rem',
                                resize: 'none',
                                background: '#f9f9f9'
                            }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
