import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Users, MessageSquare, AlertTriangle, Sparkles, Wand2, Loader2, Building2 } from 'lucide-react';
import { notificationService } from '@/lib/notificationService';
import { aiService } from '@/lib/aiService';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import { Search, Check } from 'lucide-react';

interface AdminMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId?: string; // If provided, it's a fixed single recipient
    recipientName?: string;
}

export default function AdminMessageModal({ isOpen, onClose, recipientId, recipientName }: AdminMessageModalProps) {
    const { locale, t } = useTranslate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // Broadcast logic states
    const [isAllMentors, setIsAllMentors] = useState(!recipientId);
    const [mentors, setMentors] = useState<UserData[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
    const [department, setDepartment] = useState<string>(''); // '' = Personal
    const [searchTerm, setSearchTerm] = useState('');
    const [fetchingMentors, setFetchingMentors] = useState(false);

    useEffect(() => {
        if (isOpen && !recipientId) {
            loadMentors();
        }
    }, [isOpen, recipientId]);

    const loadMentors = async () => {
        setFetchingMentors(true);
        try {
            const allUsers = await userService.getAllUsers();
            const mentorList = allUsers.filter(u => u.role === 'mentor');
            setMentors(mentorList);
        } catch (error) {
            console.error('Error loading mentors:', error);
            toast.error('Erro ao carregar lista de mentores');
        } finally {
            setFetchingMentors(false);
        }
    };

    const toggleMentorSelection = (id: string) => {
        setSelectedMentorIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.businessName && m.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAiGenerate = async () => {
        if (!title.trim()) {
            toast.error(t('ai.promptOrient'));
            return;
        }

        setAiLoading(true);
        try {
            const prompt = `Crie uma mensagem sofisticada e profissional para os nossos mentores sobre o seguinte assunto: "${title}". O tom deve ser motivador, luxuoso e direto ao ponto.`;
            const data = await aiService.chat(prompt, locale);
            setContent(data.reply);
            toast.success(t('ai.toastSuccess'));
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || t('ai.toastError'));
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalRecipientId = recipientId
                ? recipientId
                : (isAllMentors ? 'all' : selectedMentorIds);

            if (!recipientId && !isAllMentors && selectedMentorIds.length === 0) {
                toast.error('Selecione pelo menos um mentor ou escolha "Todos os Mentores"');
                setLoading(false);
                return;
            }

            await notificationService.sendNotification({
                recipientId: finalRecipientId,
                title,
                content,
                type,
                actionUrl: type === 'welcome' ? '/dashboard/mentor' : undefined,
                department: department || undefined
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

                    <form onSubmit={handleSubmit} style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                        {!recipientId && (
                            <div style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '20px', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Destinatários</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAllMentors(true)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: isAllMentors ? '#000' : 'transparent',
                                                color: isAllMentors ? '#FFD700' : '#888',
                                                border: isAllMentors ? 'none' : '1px solid #ddd',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Todos os Mentores
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAllMentors(false)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: !isAllMentors ? '#000' : 'transparent',
                                                color: !isAllMentors ? '#FFD700' : '#888',
                                                border: !isAllMentors ? 'none' : '1px solid #ddd',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Selecionar Específicos
                                        </button>
                                    </div>
                                </div>

                                {!isAllMentors && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nome, email ou negócio..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{
                                            maxHeight: '150px',
                                            overflowY: 'auto',
                                            display: 'grid',
                                            gap: '5px',
                                            padding: '10px',
                                            background: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid #eee'
                                        }}>
                                            {fetchingMentors ? (
                                                <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: '#999' }}>Carregando mentores...</div>
                                            ) : filteredMentors.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: '#999' }}>Nenhum mentor encontrado</div>
                                            ) : (
                                                filteredMentors.map(mentor => (
                                                    <div
                                                        key={mentor.id || mentor._id}
                                                        onClick={() => toggleMentorSelection(mentor.id || mentor._id!)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            background: selectedMentorIds.includes(mentor.id || mentor._id!) ? 'rgba(255,215,0,0.1)' : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '4px',
                                                            border: '2px solid',
                                                            borderColor: selectedMentorIds.includes(mentor.id || mentor._id!) ? '#FFD700' : '#ddd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: selectedMentorIds.includes(mentor.id || mentor._id!) ? '#FFD700' : 'transparent'
                                                        }}>
                                                            {selectedMentorIds.includes(mentor.id || mentor._id!) && <Check size={12} color="#000" strokeWidth={4} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{mentor.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>{mentor.businessName || mentor.email}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {selectedMentorIds.length > 0 && (
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFD700', padding: '0 5px' }}>
                                                {selectedMentorIds.length} selecionado(s)
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <Building2 size={16} /> Enviar como:
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem',
                                    background: '#fcfcfc',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <option value="">👤 Pessoal (Meu Nome)</option>
                                <option value="finance">💰 Departamento Financeiro</option>
                                <option value="support">🛠️ Suporte Técnico</option>
                                <option value="marketing">📢 Marketing & Eventos</option>
                                <option value="onboarding">✨ Equipe de Onboarding</option>
                                <option value="general">🏛️ Administração Geral</option>
                            </select>
                        </div>

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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Conteúdo</label>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={aiLoading}
                                    style={{
                                        background: 'rgba(255,215,0,0.1)',
                                        border: '1px solid rgba(255,215,0,0.3)',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#b8860b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    {t('ai.buttonWrite')}
                                </motion.button>
                            </div>
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
