"use client";

import { useState, useEffect } from 'react';
import { serviceService, ServiceModel, CreateServiceData } from '@/lib/serviceService';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslate } from '@/context/LanguageContext';

export default function ServicesManagement() {
    const { t } = useTranslate();
    const [services, setServices] = useState<ServiceModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceModel | null>(null);

    const [formData, setFormData] = useState<CreateServiceData>({
        title: '',
        description: '',
        category: 'Consultoria',
        price: 0,
        currency: 'USD',
        images: [],
        tags: [],
        contactInfo: {},
        delivery: 'Online',
        duration: '',
        ctaText: 'Solicitar'
    });

    const categories = ['Consultoria', 'Mentoria', 'Treinamento', 'Design', 'Desenvolvimento', 'Marketing', 'Outro'];

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await serviceService.getMyServices();
                setServices(data);
            } catch (error) {
                console.error(error);
                toast.error(t('dashboard.servicesManagement.errorLoading'));
            } finally {
                setLoading(false);
            }
        };
        loadServices();
    }, [t]);

    const loadServices = async () => {
        try {
            const data = await serviceService.getMyServices();
            setServices(data);
        } catch (error) {
            console.error(error);
            toast.error(t('dashboard.servicesManagement.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                await serviceService.updateService(editingService._id, formData);
                toast.success(t('dashboard.servicesManagement.updateSuccess'));
            } else {
                await serviceService.createService(formData);
                toast.success(t('dashboard.servicesManagement.createSuccess'));
            }
            setIsModalOpen(false);
            resetForm();
            loadServices();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('dashboard.servicesManagement.errorSaving');
            toast.error(message);
        }
    };

    const handleEdit = (service: ServiceModel) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price,
            currency: service.currency,
            images: service.images,
            tags: service.tags,
            contactInfo: service.contactInfo,
            delivery: service.delivery,
            duration: service.duration,
            ctaText: service.ctaText || 'Solicitar'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('dashboard.servicesManagement.deleteConfirm'))) return;

        try {
            await serviceService.deleteService(id);
            toast.success(t('dashboard.servicesManagement.deleteSuccess'));
            loadServices();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('dashboard.servicesManagement.errorDeleting');
            toast.error(message);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await serviceService.toggleServiceStatus(id);
            toast.success(t('dashboard.servicesManagement.statusUpdated'));
            loadServices();
        } catch {
            toast.error(t('dashboard.servicesManagement.errorSaving'));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'Consultoria',
            price: 0,
            currency: 'USD',
            images: [],
            tags: [],
            contactInfo: {},
            delivery: 'Online',
            duration: '',
            ctaText: 'Solicitar'
        });
        setEditingService(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={40} color="#FFD700" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('dashboard.servicesManagement.title')}</h2>
                    <p style={{ color: '#666' }}>{t('dashboard.servicesManagement.subtitle')}</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.8rem 1.5rem',
                        background: 'var(--gold-gradient)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                    }}
                >
                    <Plus size={20} />
                    {t('dashboard.servicesManagement.newService')}
                </button>
            </div>

            {/* Services Grid */}
            {services.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {services.map(service => (
                        <motion.div
                            key={service._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'var(--paper)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                position: 'relative'
                            }}
                        >
                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                background: service.active ? '#10b981' : '#ef4444',
                                color: '#fff',
                                fontSize: '0.7rem',
                                fontWeight: 700
                            }}>
                                {service.active ? t('dashboard.servicesManagement.active') : t('dashboard.servicesManagement.inactive')}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <Package size={32} color="#FFD700" style={{ marginBottom: '0.5rem' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{service.title}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                                    {service.description.substring(0, 100)}...
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    background: 'rgba(255,215,0,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#FFD700'
                                }}>
                                    {service.category}
                                </span>
                            </div>

                            {service.price && service.price > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--foreground)' }}>
                                        {service.currency} {service.price.toLocaleString()}
                                    </strong>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
                                <div><Eye size={14} style={{ display: 'inline', marginRight: '4px' }} />{service.views} views</div>
                                <div>•</div>
                                <div>{service.inquiries} interessados</div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleToggleStatus(service._id)}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        background: 'var(--muted)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.85rem'
                                    }}
                                    title={service.active ? 'Desativar' : 'Ativar'}
                                >
                                    {service.active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(service)}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        background: '#4facfe',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service._id)}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        background: '#ef4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{
                    padding: '3rem',
                    background: 'var(--paper)',
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: '1px dashed var(--border)'
                }}>
                    <Package size={60} color="#666" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('dashboard.servicesManagement.noServices')}</h3>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>{t('dashboard.servicesManagement.noServicesDesc')}</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            padding: '0.8rem 2rem',
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {t('dashboard.servicesManagement.createFirst')}
                    </button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '1rem'
                        }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--paper)',
                                borderRadius: '20px',
                                padding: '2rem',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                                {editingService ? t('dashboard.servicesManagement.edit') : t('dashboard.servicesManagement.new')}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.titleLabel')} *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--foreground)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.descriptionLabel')} *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--foreground)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.categoryLabel')} *</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)'
                                            }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{t(`dashboard.servicesManagement.categories.${cat}`)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.deliveryLabel')}</label>
                                        <select
                                            value={formData.delivery}
                                            onChange={e => setFormData({ ...formData, delivery: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)'
                                            }}
                                        >
                                            <option value="Online">{t('dashboard.servicesManagement.delivery.Online')}</option>
                                            <option value="Presencial">{t('dashboard.servicesManagement.delivery.Presencial')}</option>
                                            <option value="Híbrido">{t('dashboard.servicesManagement.delivery.Híbrido')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.durationLabel')}</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                            placeholder="Ex: 1h, 4 semanas..."
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.priceLabel')}</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            min={0}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('dashboard.servicesManagement.currencyLabel')}</label>
                                        <select
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--background)',
                                                color: 'var(--foreground)'
                                            }}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="MZN">MZN</option>
                                            <option value="AOA">AOA</option>
                                            <option value="CVE">CVE</option>
                                            <option value="XOF">XOF</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Texto do Botão (CTA)</label>
                                    <input
                                        type="text"
                                        value={formData.ctaText}
                                        onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                        placeholder="Ex: Solicitar, Contactar, Orçamento..."
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--foreground)'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: 'var(--muted)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('dashboard.servicesManagement.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem',
                                            background: 'var(--gold-gradient)',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {editingService ? t('dashboard.servicesManagement.update') : t('dashboard.servicesManagement.create')} {t('dashboard.servicesManagement.titleLabel')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
