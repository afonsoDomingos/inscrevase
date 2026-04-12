'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, X, Globe, Check, Loader2, ChevronDown } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Tooltip from '../common/Tooltip';

interface ManualPaymentMethod {
    id: string;
    country: string;
    countryLabel: string;
    label: string;
    icon: string;
    details: string;
    active: boolean;
}

const COUNTRY_OPTIONS = [
    { code: 'MZ', label: 'Moçambique', flag: '🇲🇿' },
    { code: 'AO', label: 'Angola', flag: '🇦🇴' },
    { code: 'GW', label: 'Guiné-Bissau', flag: '🇬🇼' },
    { code: 'CV', label: 'Cabo Verde', flag: '🇨🇻' },
    { code: 'ST', label: 'São Tomé e Príncipe', flag: '🇸🇹' },
    { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
    { code: 'BR', label: 'Brasil', flag: '🇧🇷' },
    { code: 'INT', label: 'Internacional', flag: '🌍' },
];

const emptyMethod: Omit<ManualPaymentMethod, 'id'> = {
    country: 'MZ',
    countryLabel: 'Moçambique',
    label: '',
    icon: '🏦',
    details: '',
    active: true,
};

export default function ManualPaymentMethodsManager() {
    const [methods, setMethods] = useState<ManualPaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [addingNew, setAddingNew] = useState(false);
    const [newMethod, setNewMethod] = useState<Omit<ManualPaymentMethod, 'id'>>(emptyMethod);

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/manual-methods`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setMethods(await res.json());
        } catch {
            toast.error('Erro ao carregar métodos de pagamento');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMethods(); }, []);

    const saveAllMethods = async (updated: ManualPaymentMethod[]) => {
        setSaving(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/manual-methods`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ methods: updated })
            });
            if (!res.ok) throw new Error();
            setMethods(updated);
            toast.success('Métodos de pagamento atualizados com sucesso!');
        } catch {
            toast.error('Erro ao guardar métodos de pagamento');
        } finally {
            setSaving(false);
        }
    };

    const handleAddMethod = async () => {
        if (!newMethod.label || !newMethod.details) {
            return toast.error('Preencha todos os campos obrigatórios');
        }
        const country = COUNTRY_OPTIONS.find(c => c.code === newMethod.country);
        const id = `${newMethod.country.toLowerCase()}_${newMethod.label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const method: ManualPaymentMethod = {
            ...newMethod,
            id,
            countryLabel: country?.label || newMethod.country,
            icon: country?.flag || '🏦',
        };
        const updated = [...methods, method];
        await saveAllMethods(updated);
        setAddingNew(false);
        setNewMethod(emptyMethod);
    };

    const handleUpdateMethod = async (id: string, updates: Partial<ManualPaymentMethod>) => {
        const updated = methods.map(m => m.id === id ? { ...m, ...updates } : m);
        await saveAllMethods(updated);
        setEditingId(null);
    };

    const handleDeleteMethod = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este método?')) return;
        const updated = methods.filter(m => m.id !== id);
        await saveAllMethods(updated);
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        const updated = methods.map(m => m.id === id ? { ...m, active: !current } : m);
        await saveAllMethods(updated);
    };

    const groupedByCountry = COUNTRY_OPTIONS.map(c => ({
        ...c,
        methods: methods.filter(m => m.country === c.code)
    })).filter(g => g.methods.length > 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111', marginBottom: '4px' }}>Métodos de Pagamento Manual</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Configure os dados de transferência que aparecem no modal de pagamento manual</p>
                </div>
                <button
                    onClick={() => setAddingNew(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                    <Plus size={16} /> Adicionar Método
                </button>
            </div>

            {/* Add new method form */}
            <AnimatePresence>
                {addingNew && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '18px', padding: '22px', marginBottom: '24px' }}
                    >
                        <h3 style={{ fontWeight: 800, marginBottom: '16px', color: '#111', fontSize: '1rem' }}>➕ Novo Método de Pagamento</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>País</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={newMethod.country}
                                        onChange={(e) => {
                                            const c = COUNTRY_OPTIONS.find(o => o.code === e.target.value);
                                            setNewMethod({ ...newMethod, country: e.target.value, countryLabel: c?.label || '', icon: c?.flag || '🏦' });
                                        }}
                                        style={selectStyle}
                                    >
                                        {COUNTRY_OPTIONS.map(c => (
                                            <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Nome do Método *</label>
                                <input value={newMethod.label} onChange={(e) => setNewMethod({ ...newMethod, label: e.target.value })} style={inputStyle} placeholder="Ex: M-Pesa, e-Mola, NIB..." />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Detalhes (número, email, IBAN...) *</label>
                                <input value={newMethod.details} onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })} style={inputStyle} placeholder="Ex: 847877405 (Nome do Titular)" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setAddingNew(false); setNewMethod(emptyMethod); }} style={cancelBtnStyle}>
                                <X size={15} /> Cancelar
                            </button>
                            <button onClick={handleAddMethod} disabled={saving} style={saveBtnStyle}>
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                Guardar Método
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <Loader2 className="animate-spin" size={32} color="#D4AF37" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {groupedByCountry.map(group => (
                        <div key={group.code}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>{group.flag}</span>
                                <span style={{ fontWeight: 800, color: '#374151', fontSize: '0.9rem' }}>{group.label}</span>
                                <span style={{ background: '#e5e7eb', color: '#6b7280', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{group.methods.length}</span>
                            </div>
                            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                {group.methods.map((method, idx) => (
                                    <div key={method.id}>
                                        {editingId === method.id ? (
                                            <EditRow
                                                method={method}
                                                onSave={(updates) => handleUpdateMethod(method.id, updates)}
                                                onCancel={() => setEditingId(null)}
                                                saving={saving}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: method.active ? '#fff' : '#fafafa', borderBottom: idx < group.methods.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', opacity: method.active ? 1 : 0.4 }}>
                                                        {method.icon}
                                                    </div>
                                                    <div style={{ opacity: method.active ? 1 : 0.5 }}>
                                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111' }}>{method.label}</p>
                                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace' }}>{method.details}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {/* Active toggle */}
                                                    <Tooltip content={method.active ? 'Desativar' : 'Ativar'}>
                                                        <button
                                                            onClick={() => handleToggleActive(method.id, method.active)}
                                                            style={{ background: method.active ? '#dcfce7' : '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: method.active ? '#16a34a' : '#9ca3af' }}
                                                        >
                                                            {method.active ? '● Ativo' : '○ Inativo'}
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content="Editar">
                                                        <button onClick={() => setEditingId(method.id)} style={iconBtnStyle}>
                                                            <Edit3 size={15} color="#6b7280" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content="Remover">
                                                        <button onClick={() => handleDeleteMethod(method.id)} style={iconBtnStyle}>
                                                            <Trash2 size={15} color="#ef4444" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {methods.length === 0 && !addingNew && (
                        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: '18px', border: '2px dashed #e5e7eb' }}>
                            <Globe size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontWeight: 600 }}>Nenhum método configurado ainda.</p>
                            <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginTop: '4px' }}>Clique em &quot;Adicionar Método&quot; para começar.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function EditRow({ method, onSave, onCancel, saving }: {
    method: ManualPaymentMethod;
    onSave: (updates: Partial<ManualPaymentMethod>) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [label, setLabel] = useState(method.label);
    const [details, setDetails] = useState(method.details);
    const [country, setCountry] = useState(method.country);

    return (
        <div style={{ padding: '14px 18px', background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                    <label style={labelStyle}>País</label>
                    <div style={{ position: 'relative' }}>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ ...selectStyle, fontSize: '0.82rem' }}>
                            {COUNTRY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Nome</label>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inputStyle, fontSize: '0.85rem' }} />
                </div>
                <div>
                    <label style={labelStyle}>Detalhes</label>
                    <input value={details} onChange={(e) => setDetails(e.target.value)} style={{ ...inputStyle, fontSize: '0.85rem' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={onCancel} style={cancelBtnStyle}><X size={13} /> Cancelar</button>
                <button
                    onClick={() => {
                        const c = COUNTRY_OPTIONS.find(o => o.code === country);
                        onSave({ label, details, country, countryLabel: c?.label || country, icon: c?.flag || '🏦' });
                    }}
                    disabled={saving}
                    style={saveBtnStyle}
                >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Guardar
                </button>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', background: '#fff', color: '#111', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '9px 30px 9px 10px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', background: '#fff', color: '#111', appearance: 'none', cursor: 'pointer' };
const iconBtnStyle: React.CSSProperties = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const saveBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', background: '#111', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' };
const cancelBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', padding: '8px 14px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' };
