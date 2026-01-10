import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Users, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';
import { notificationService } from '@/lib/notificationService';
import { toast } from 'sonner';

interface AdminMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId?: string; // If null, it's a broadcast
    recipientName?: string;
}

export default function AdminMessageModal({ isOpen, onClose, recipientId, recipientName }: AdminMessageModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('personal');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await notificationService.sendNotification({
                recipientId: recipientId || 'all',
                title,
                content,
                type,
                actionUrl: type === 'welcome' ? '/dashboard/mentor' : undefined
            });

            toast.success(recipientId ? `Mensagem enviada para ${recipientName}` : 'Broadcast enviado para todos os mentores!');
            setTitle('');
            setContent('');
            onClose();
        } catch {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '600px',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-playfair)' }}>
                                {recipientId ? `Mensagem para ${recipientName}` : 'Enviar Broadcast Global'}
                            </h2>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                                {recipientId ? 'A comunicação direta fortalece a comunidade.' : 'Esta mensagem será enviada para TODOS os mentores cadastrados.'}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Título da Mensagem</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Importante: Novas taxas da plataforma"
                                required
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Alerta</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {[
                                    { id: 'personal', label: 'Pessoal', icon: <MessageSquare size={16} /> },
                                    { id: 'announcement', label: 'Anúncio', icon: <Users size={16} /> },
                                    { id: 'alert', label: 'Alerta', icon: <AlertTriangle size={16} /> },
                                    { id: 'welcome', label: 'Premium', icon: <Sparkles size={16} /> }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setType(item.id)}
                                        style={{
                                            padding: '10px 5px',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: type === item.id ? '#FFD700' : '#eee',
                                            background: type === item.id ? 'rgba(255,215,0,0.1)' : '#f9f9f9',
                                            color: type === item.id ? '#000' : '#888',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Conteúdo</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Escreva sua mensagem aqui..."
                                required
                                rows={5}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', resize: 'none', transition: 'border-color 0.3s' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', background: '#fff', color: '#333', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'var(--gold-gradient)',
                                    color: '#000',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}
                            >
                                {loading ? 'Enviando...' : <><Send size={18} /> Enviar Mensagem</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
