'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link as LinkIcon,
    Plus,
    Copy,
    Trash2,
    ExternalLink,
    Settings2,
    Zap,
    Check,
    Search,
    ArrowRight,
    Globe,
    Facebook,
    Loader2,
    X,
    Activity
} from 'lucide-react';
import { smartLinkService, SmartLinkModel } from '@/lib/smartLinkService';
import { toast } from 'sonner';
import { authService, UserData } from '@/lib/authService';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';
import { AlertTriangle, Sparkles } from 'lucide-react';

export const SmartLinksManager = () => {
    const [links, setLinks] = useState<SmartLinkModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const PLAN_LIMITS = {
        free: 1,
        pro: 10,
        enterprise: Infinity,
        premium: Infinity
    };

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'direct' as 'direct' | 'bio',
        originalUrl: '',
        slug: '',
        facebookPixelId: '',
        googleAnalyticsId: '',
        brandingColor: '#FFD700',
        category: 'marketing',
        links: [] as Array<{ title: string; url: string; icon?: string; color?: string }>,
        bioSettings: {
            bioText: '',
            theme: 'aura-teal'
        }
    });

    const [newLinkItem, setNewLinkItem] = useState({ title: '', url: '' });
    const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

    const addLinkItem = () => {
        if (!newLinkItem.title || !newLinkItem.url) return;

        if (editingLinkIndex !== null) {
            // Update existing link
            const updatedLinks = [...formData.links];
            updatedLinks[editingLinkIndex] = newLinkItem;
            setFormData({
                ...formData,
                links: updatedLinks
            });
            setEditingLinkIndex(null);
        } else {
            // Add new link
            setFormData({
                ...formData,
                links: [...formData.links, newLinkItem]
            });
        }
        setNewLinkItem({ title: '', url: '' });
    };

    const editLinkItem = (index: number) => {
        setNewLinkItem(formData.links[index]);
        setEditingLinkIndex(index);
    };

    const removeLinkItem = (index: number) => {
        setFormData({
            ...formData,
            links: formData.links.filter((_, i) => i !== index)
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);




    useEffect(() => {
        loadLinks();
    }, []);

    // Refresh when modal closes (might have upgraded)
    useEffect(() => {
        if (!isUpgradeModalOpen) {
            loadLinks();
        }
    }, [isUpgradeModalOpen]);

    const loadLinks = async () => {
        try {
            setLoading(true);
            const [linksData, userData] = await Promise.all([
                smartLinkService.getMyLinks(),
                authService.getProfile()
            ]);
            setLinks(linksData);
            setUser(userData);
        } catch {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const [linkingId, setLinkingId] = useState<string | null>(null);

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'direct',
            originalUrl: '',
            slug: '',
            facebookPixelId: '',
            googleAnalyticsId: '',
            brandingColor: '#FFD700',
            category: 'marketing',
            links: [],
            bioSettings: {
                bioText: '',
                theme: 'aura-teal'
            }
        });
        setLinkingId(null);
        setEditingLinkIndex(null);
        setNewLinkItem({ title: '', url: '' });
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || (formData.type === 'direct' && !formData.originalUrl)) {
            toast.error('Por favor, preencha os campos obrigatórios');
            return;
        }

        try {
            setIsSubmitting(true);
            if (linkingId) {
                await smartLinkService.updateLink(linkingId, formData);
                toast.success('Smartlink atualizado! ✨');
            } else {
                await smartLinkService.createLink(formData);
                toast.success('Smartlink criado com sucesso! 🚀');
            }
            setIsCreateModalOpen(false);
            resetForm();
            loadLinks();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro ao processar sua solicitação';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (link: SmartLinkModel) => {
        setFormData({
            title: link.title,
            type: link.type || 'direct',
            originalUrl: link.originalUrl || '',
            slug: link.slug,
            facebookPixelId: link.facebookPixelId || '',
            googleAnalyticsId: link.googleAnalyticsId || '',
            brandingColor: link.brandingColor || '#FFD700',
            category: link.category || 'marketing',
            links: link.links || [],
            bioSettings: {
                bioText: link.bioSettings?.bioText || '',
                theme: link.bioSettings?.theme || 'dark'
            }
        });
        setLinkingId(link._id || null);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este link?')) return;
        try {
            await smartLinkService.deleteLink(id);
            toast.success('Link removido');
            setLinks(links.filter(l => l._id !== id));
        } catch {
            toast.error('Erro ao excluir link');
        }
    };

    const copyToClipboard = (slug: string, type: string, id: string) => {
        const fullUrl = `${window.location.origin}/l/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopyingId(id);
        toast.success('Link copiado!');
        setTimeout(() => setCopyingId(null), 2000);
    };

    const filteredLinks = links.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalClicks = links.reduce((acc, l) => acc + (l.totalClicks || 0), 0);

    const handleNewLinkClick = () => {
        if (user && !linkingId && links.length >= PLAN_LIMITS[user.plan || 'free']) {
            setIsUpgradeModalOpen(true);
        } else {
            resetForm();
            setIsCreateModalOpen(true);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header Stats & Search */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Smartlinks</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Transforme seus links em máquinas de dados e marketing</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total de Clicks</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{totalClicks}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Links Ativos</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{links.length}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar por título ou slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '50px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem' }}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewLinkClick}
                        style={{
                            background: '#0f172a', color: '#fff', border: 'none', padding: '12px 25px',
                            borderRadius: '50px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        Novo Link <Plus size={18} />
                    </motion.button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={40} color="#FFD700" />
                </div>
            ) : filteredLinks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <LinkIcon size={40} color="#cbd5e1" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Ainda não tem Smartlinks?</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Comece a rastrear seus acessos e melhorar suas campanhas agora mesmo.</p>
                    <button onClick={handleNewLinkClick} className="btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}>Criar Meu Primeiro Smartlink</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {filteredLinks.map((link, index) => (
                        <motion.div
                            key={link._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.005, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                        >
                            {/* Icon/Color */}
                            <div style={{
                                width: '60px', height: '60px', background: link.brandingColor + '20', borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                            }}>
                                <LinkIcon color={link.brandingColor} size={24} />
                                {link.facebookPixelId && (
                                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#1877F2', padding: '4px', borderRadius: '50%', color: '#fff' }}>
                                        <Facebook size={12} fill="#fff" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{link.title}</h4>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{link.category}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.originalUrl}</p>
                                    <ArrowRight size={12} color="#cbd5e1" />
                                </div>
                            </div>

                            {/* Link Display & Copy */}
                            <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                                    inscrevase.com/l/<span style={{ color: '#0f172a' }}>{link.slug}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (link._id) copyToClipboard(link.slug, link.type || 'direct', link._id);
                                    }}
                                    style={{ border: 'none', background: copyingId === link._id ? '#22c55e' : '#fff', color: copyingId === link._id ? '#fff' : '#64748b', padding: '8px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center' }}
                                >
                                    {copyingId === link._id ? <Check size={16} /> : <Copy size={16} />}
                                </motion.button>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Clicks</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{link.totalClicks || 0}</div>
                                </div>
                                <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Status</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 800, color: '#22c55e' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} /> Ativo
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); handleEdit(link); }}
                                    style={{ padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff', color: '#64748b', cursor: 'pointer' }}
                                    title="Editar"
                                >
                                    <Settings2 size={18} />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (link._id) handleDelete(link._id);
                                    }}
                                    style={{ padding: '10px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer' }}
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </motion.button>
                                <motion.a
                                    href={`${typeof window !== 'undefined' ? window.location.origin : ''}/l/${link.slug}`}
                                    target="_blank"
                                    whileTap={{ scale: 0.9 }}
                                    style={{ padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Abrir Link"
                                >
                                    <ExternalLink size={18} />
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(5px)' }}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
                        >
                            {/* Header */}
                            <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                                        {linkingId ? 'Editar Smartlink' : 'Novo Smartlink'} <Zap size={20} fill="#FFD700" color="#FFD700" style={{ display: 'inline', marginLeft: '5px' }} />
                                    </h3>
                                    {!linkingId && user && (
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                                            Plano: <span style={{ color: '#000', fontWeight: 800, textTransform: 'uppercase' }}>{user.plan || 'Free'}</span>
                                            ({links.length} / {PLAN_LIMITS[user.plan || 'free'] === Infinity ? '∞' : PLAN_LIMITS[user.plan || 'free']} links)
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} style={{ background: '#f8fafc', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            {/* Plan Limit Feedback */}
                            {!linkingId && user && links.length >= PLAN_LIMITS[user.plan || 'free'] ? (
                                <div style={{
                                    background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid #fde68a',
                                    textAlign: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{ width: '60px', height: '60px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                        <AlertTriangle size={30} color="#d97706" />
                                    </div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '10px' }}>Limite de Links Atingido</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                                        O seu plano atual permite criar até {PLAN_LIMITS[user.plan || 'free']} link(s).
                                        Para criar mais e desbloquear estatísticas profissionais, faça o upgrade para o Pro.
                                    </p>
                                    <button
                                        onClick={() => { setIsCreateModalOpen(false); setIsUpgradeModalOpen(true); }}
                                        style={{
                                            background: '#000',
                                            color: '#fff',
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            margin: '0 auto'
                                        }}
                                    >
                                        Upgrade para Pro <Sparkles size={18} />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateOrUpdate} style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                                        {/* Type Toggle */}
                                        <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'direct' })}
                                                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: formData.type === 'direct' ? '#fff' : 'transparent', fontWeight: 800, color: formData.type === 'direct' ? '#0f172a' : '#94a3b8', boxShadow: formData.type === 'direct' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                                            >Link Direto</button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'bio' })}
                                                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: formData.type === 'bio' ? '#fff' : 'transparent', fontWeight: 800, color: formData.type === 'bio' ? '#0f172a' : '#94a3b8', boxShadow: formData.type === 'bio' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                                            >Página Bio (Vários Links)</button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Título</label>
                                                <input
                                                    type="text" required placeholder="Ex: Minha Mentoria VIP"
                                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Categoria</label>
                                                <select
                                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                                >
                                                    <option value="marketing">Marketing</option>
                                                    <option value="event">Evento</option>
                                                    <option value="direct">WhatsApp/Direct</option>
                                                    <option value="social">Redes Sociais</option>
                                                </select>
                                            </div>
                                        </div>

                                        {formData.type === 'direct' ? (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>URL de Destino</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Globe style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                                                    <input
                                                        type="text" required placeholder="https://instagram.com/seu-perfil"
                                                        value={formData.originalUrl} onChange={e => setFormData({ ...formData, originalUrl: e.target.value })}
                                                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ border: '1px solid #f1f5f9', padding: '1.5rem', borderRadius: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Gerenciar Links da Página Bio</label>

                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                                                    <input
                                                        type="text" placeholder="Nome (Ex: WhatsApp)"
                                                        value={newLinkItem.title} onChange={e => setNewLinkItem({ ...newLinkItem, title: e.target.value })}
                                                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    />
                                                    <input
                                                        type="text" placeholder="URL"
                                                        value={newLinkItem.url} onChange={e => setNewLinkItem({ ...newLinkItem, url: e.target.value })}
                                                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                                    />
                                                    <button type="button" onClick={addLinkItem} style={{ background: '#FFD700', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                                                        {editingLinkIndex !== null ? 'Salvar' : '+'}
                                                    </button>
                                                    {editingLinkIndex !== null && (
                                                        <button type="button" onClick={() => { setEditingLinkIndex(null); setNewLinkItem({ title: '', url: '' }); }} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }} title="Cancelar">
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {formData.links.map((linkItem, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '10px 15px',
                                                            background: editingLinkIndex === idx ? '#fff7ed' : '#f8fafc',
                                                            borderRadius: '12px',
                                                            border: editingLinkIndex === idx ? '1px solid #ffedd5' : '1px solid transparent'
                                                        }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{linkItem.title}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkItem.url}</div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button type="button" onClick={() => editLinkItem(idx)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '5px' }} title="Editar"><Settings2 size={16} /></button>
                                                                <button type="button" onClick={() => removeLinkItem(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }} title="Remover"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ marginTop: '1.5rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Texto da Biografia</label>
                                                    <textarea
                                                        placeholder="Uma breve descrição sobre você..."
                                                        value={formData.bioSettings.bioText} onChange={e => setFormData({ ...formData, bioSettings: { ...formData.bioSettings, bioText: e.target.value } })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '80px' }}
                                                    />
                                                </div>

                                                {/* Theme Selector */}
                                                <div style={{ marginTop: '1.5rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Tema da Página Bio</label>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        {[
                                                            { value: 'aura-teal', label: '🌿 Teal', bg: 'radial-gradient(at 0% 0%, #2dd4bf50 0%, transparent 50%), radial-gradient(at 100% 100%, #6366f130 0%, transparent 50%), #fff', text: '#000', border: '#2dd4bf' },
                                                            { value: 'aura-candy', label: '🍬 Candy', bg: 'radial-gradient(at 0% 0%, #fbcfe880 0%, transparent 50%), radial-gradient(at 100% 0%, #fef08a60 0%, transparent 50%), radial-gradient(at 50% 100%, #bfdbfe80 0%, transparent 50%), #fff', text: '#000', border: '#fbcfe8' },
                                                            { value: 'aura-sunset', label: '🌅 Peach', bg: 'radial-gradient(at 0% 0%, #ffedd5 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff', text: '#000', border: '#ffedd5' },
                                                            { value: 'aura-nordic', label: '❄️ Nordic', bg: 'radial-gradient(at 0% 0%, #e0f2fe 0%, transparent 50%), radial-gradient(at 100% 0%, #f3e8ff 0%, transparent 50%), radial-gradient(at 50% 100%, #fefce8 0%, transparent 50%), #fff', text: '#000', border: '#e0f2fe' },
                                                            { value: 'aura-lavender', label: '⚛️ Lavanda', bg: 'radial-gradient(at 0% 0%, #f5f3ff 0%, transparent 50%), radial-gradient(at 100% 100%, #ddd6fe 0%, transparent 50%), #fff', text: '#000', border: '#ddd6fe' },
                                                            { value: 'aura-rose', label: '🌸 Rose', bg: 'radial-gradient(at 0% 0%, #fff1f2 0%, transparent 50%), radial-gradient(at 100% 100%, #fecdd3 0%, transparent 50%), #fff', text: '#000', border: '#fecdd3' },
                                                            { value: 'aura-forest', label: '🌲 Forest', bg: 'radial-gradient(at 0% 0%, #f0fdf4 0%, transparent 50%), radial-gradient(at 100% 100%, #dcfce7 0%, transparent 50%), #fff', text: '#000', border: '#dcfce7' },
                                                            { value: 'aura-sky', label: '☁️ Sky', bg: 'radial-gradient(at 0% 0%, #f0f9ff 0%, transparent 50%), radial-gradient(at 100% 100%, #e0f2fe 0%, transparent 50%), #fff', text: '#000', border: '#e0f2fe' },
                                                            { value: 'aura-sunset-deep', label: '🌇 Deep', bg: 'radial-gradient(at 0% 0%, #f7258540 0%, transparent 50%), radial-gradient(at 100% 100%, #ff8c0040 0%, transparent 50%), #fff', text: '#000', border: '#f72585' },
                                                            { value: 'orange-white', label: '🟠 Laranja', bg: 'linear-gradient(135deg, #fff 0%, #ff8c00 100%)', text: '#000', border: '#ff8c00' },
                                                            { value: 'light', label: '☀️ Claro', bg: '#ffffff', text: '#0f172a', border: '#e2e8f0' },
                                                            { value: 'dark', label: '🌙 Escuro', bg: '#1e293b', text: '#ffffff', border: '#334155' },
                                                            { value: 'black', label: '⚫ Preto', bg: '#000000', text: '#ffffff', border: '#1a1a1a' },
                                                            { value: 'aura-night', label: '🌃 Night', bg: 'radial-gradient(at 0% 0%, #1e1b4b 0%, transparent 50%), radial-gradient(at 100% 100%, #312e81 0%, transparent 50%), #0f172a', text: '#fff', border: '#1e1b4b' },
                                                            { value: 'aura-gold', label: '✨ Gold', bg: 'radial-gradient(at 0% 0%, #fef3c7 0%, transparent 50%), radial-gradient(at 100% 100%, #fde68a 0%, transparent 50%), #fff', text: '#000', border: '#fde68a' },
                                                            { value: 'royal', label: '👑 Royal', bg: 'linear-gradient(135deg, #0f172a 0%, #FFD700 100%)', text: '#fff', border: '#FFD700' },
                                                            { value: 'aurora', label: '✨ Aurora', bg: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', text: '#fff', border: '#4facfe' },
                                                        ].map(t => (
                                                            <button
                                                                key={t.value}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, bioSettings: { ...formData.bioSettings, theme: t.value } })}
                                                                style={{
                                                                    flex: '1 0 calc(33.33% - 14px)', minWidth: '80px', padding: '12px 8px', borderRadius: '12px',
                                                                    background: t.bg, color: t.text,
                                                                    border: formData.bioSettings.theme === t.value ? `2px solid #FFD700` : `1px solid ${t.border}`,
                                                                    fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer',
                                                                    boxShadow: formData.bioSettings.theme === t.value ? '0 0 0 3px #FFD70030' : 'none',
                                                                    transition: 'all 0.2s',
                                                                    marginBottom: '4px'
                                                                }}
                                                            >
                                                                {t.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Slug Personalizado (Opcional)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                <span style={{ padding: '0 12px', fontSize: '0.85rem', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>inscrevase.com/l/</span>
                                                <input
                                                    type="text" placeholder="meu-link"
                                                    value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                    style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e0f2fe' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '1rem' }}>
                                                <Activity size={18} />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>Marketing & Rastreamento</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#64748b', marginBottom: '5px' }}>ID do Pixel Facebook</label>
                                                    <input
                                                        type="text" placeholder="123456789"
                                                        value={formData.facebookPixelId} onChange={e => setFormData({ ...formData, facebookPixelId: e.target.value })}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bae6fd', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#64748b', marginBottom: '5px' }}>Google Analytics ID</label>
                                                    <input
                                                        type="text" placeholder="G-XXXXXXXX"
                                                        value={formData.googleAnalyticsId} onChange={e => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bae6fd', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>Cor da Marca:</label>
                                                <input
                                                    type="color" value={formData.brandingColor}
                                                    onChange={e => setFormData({ ...formData, brandingColor: e.target.value })}
                                                    style={{ border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                                                />
                                            </div>

                                            <button
                                                disabled={isSubmitting}
                                                className="btn-primary"
                                                style={{ padding: '0.8rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>{linkingId ? 'Salvar Alterações' : 'Ativar Smartlink'} <ArrowRight size={18} /></>}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />
            <style jsx>{`
                .btn-primary {
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary:hover {
                    background: #1e293b;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};
