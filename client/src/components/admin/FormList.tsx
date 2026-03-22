"use client";

import { useState, useEffect } from 'react';
import { formService, FormModel } from '@/lib/formService';
import { authService, UserData } from '@/lib/authService';
import { Trash2, ExternalLink, Eye, EyeOff, Search, FileText, Zap, Pencil, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import EditEventModal from '@/components/mentor/EditEventModal';
import TableScrollWrapper from '../common/TableScrollWrapper';
import Tooltip from '../common/Tooltip';
import { useTranslate } from '@/context/LanguageContext';

interface FormListProps {
    onEmailMentor?: (mentorId: string, mentorName: string, formDetails: FormModel) => void;
}

export default function FormList({ onEmailMentor }: FormListProps) {
    const { t } = useTranslate();
    const [forms, setForms] = useState<FormModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'error' | 'success' } | null>(null);
    const [selectedForm, setSelectedForm] = useState<FormModel | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const loggedUser = authService.getCurrentUser();
        setCurrentUser(loggedUser);
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            const data = await formService.getAllFormsAdmin();
            setForms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (form: FormModel) => {
        try {
            await formService.toggleFormStatus(form._id, !form.active);
            loadForms();
        } catch (error: unknown) {
            console.error(error);
            alert(t('dashboard.adminForms.messages.statusError'));
        }
    };

    const handleToggleSponsor = async (form: FormModel) => {
        // Limit promoted events for non-SuperAdmins
        if (currentUser?.role !== 'SuperAdmin' && !form.isSponsored) {
            const sponsoredCount = forms.filter(f => f.isSponsored).length;
            if (sponsoredCount >= 4) {
                setAlertMessage({
                    title: t('dashboard.adminForms.messages.limitTitle'),
                    message: t('dashboard.adminForms.messages.limitReached'),
                    type: 'error'
                });
                return;
            }
        }

        try {
            await formService.toggleSponsorship(form._id);
            loadForms();
        } catch (error) {
            console.error(error);
            alert(t('dashboard.adminForms.messages.promoteError'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('dashboard.adminForms.actions.deleteConfirm'))) return;
        try {
            await formService.deleteForm(id);
            loadForms();
        } catch (error: unknown) {
            console.error(error);
            alert(t('dashboard.adminForms.messages.deleteError'));
        }
    };

    const filteredForms = forms.filter(f =>
        (f.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.creator?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentForms = filteredForms.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('dashboard.adminForms.messages.loadError')}</div>;

    return (
        <div className="luxury-card" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('dashboard.adminForms.title')}</h3>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder={t('dashboard.adminForms.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset page on search
                        }}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <TableScrollWrapper>
                <table style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminForms.table.title')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminForms.table.creator')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminForms.table.status')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800 }}>{t('dashboard.adminForms.table.date')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'center' }}>{t('dashboard.adminForms.table.visits')}</th>
                            <th style={{ padding: '1rem', color: '#1a1a1a', fontWeight: 800, textAlign: 'right' }}>{t('dashboard.adminForms.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentForms.map((form) => (
                            <motion.tr
                                layout
                                key={form._id}
                                style={{ borderBottom: '1px solid #f9f9f9' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontWeight: 600 }}>{form.title}</div>
                                        {form.isSponsored && (
                                            <span style={{ background: '#FFD700', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>{t('dashboard.adminForms.sponsored')}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>/{form.slug}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{form.creator?.name || '---'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{form.creator?.businessName || t('dashboard.adminForms.noCompany')}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: form.active ? '#38a16915' : '#e53e3e15',
                                        color: form.active ? '#38a169' : '#e53e3e',
                                        textTransform: 'uppercase'
                                    }}>
                                        {form.active ? t('dashboard.adminForms.status.active') : t('dashboard.adminForms.status.inactive')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>
                                    {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>
                                        <Eye size={14} /> {form.visits || 0}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <Tooltip content={t('dashboard.adminForms.actions.viewPublic')}>
                                            <a
                                                href={`/f/${form.slug}`}
                                                target="_blank"
                                                style={{ color: '#3182ce' }}
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </Tooltip>
                                        {onEmailMentor && form.creator && (
                                            <Tooltip content={t('dashboard.adminForms.actions.emailMentor')}>
                                                <button
                                                    onClick={() => onEmailMentor(form.creator._id || '', form.creator.name, form)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8860B' }}
                                                >
                                                    <Mail size={18} />
                                                </button>
                                            </Tooltip>
                                        )}
                                        <Tooltip content={t('dashboard.adminForms.actions.editEvent')}>
                                            <button
                                                onClick={() => {
                                                    setSelectedForm(form);
                                                    setIsEditModalOpen(true);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3182ce' }}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content={form.isSponsored ? t('dashboard.adminForms.actions.removePromote') : t('dashboard.adminForms.actions.promoteEvent')}>
                                            <button
                                                onClick={() => handleToggleSponsor(form)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.isSponsored ? '#FFA500' : '#888' }}
                                            >
                                                <Zap size={18} fill={form.isSponsored ? '#FFA500' : 'none'} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content={form.active ? t('dashboard.adminForms.actions.deactivate') : t('dashboard.adminForms.actions.activate')}>
                                            <button
                                                onClick={() => handleToggleStatus(form)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.active ? '#888' : '#38a169' }}
                                            >
                                                {form.active ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </Tooltip>
                                        <Tooltip content={t('dashboard.adminForms.actions.delete')}>
                                            <button
                                                onClick={() => handleDelete(form._id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredForms.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FileText size={40} style={{ color: '#eee', marginBottom: '1rem' }} />
                        <p style={{ color: '#999' }}>{t('dashboard.adminForms.messages.noForms')}</p>
                    </div>
                )}
            </TableScrollWrapper>

            {/* Pagination Controls */}
            {filteredForms.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                    <div>
                        {t('dashboard.adminForms.pagination.showing')
                            .replace('{start}', String(indexOfFirstItem + 1))
                            .replace('{end}', String(Math.min(indexOfLastItem, filteredForms.length)))
                            .replace('{total}', String(filteredForms.length))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                color: currentPage === 1 ? '#aaa' : '#333',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {t('dashboard.adminForms.pagination.prev')}
                        </button>
                        {Array.from({ length: Math.ceil(filteredForms.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: currentPage === i + 1 ? 'none' : '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: currentPage === i + 1 ? '#FFD700' : '#fff',
                                    color: currentPage === i + 1 ? '#000' : '#333',
                                    fontWeight: currentPage === i + 1 ? 700 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredForms.length / itemsPerPage)))}
                            disabled={indexOfLastItem >= filteredForms.length}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: indexOfLastItem >= filteredForms.length ? '#f5f5f5' : '#fff',
                                color: indexOfLastItem >= filteredForms.length ? '#aaa' : '#333',
                                cursor: indexOfLastItem >= filteredForms.length ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {t('dashboard.adminForms.pagination.next')}
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Alert Modal */}
            {alertMessage && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setAlertMessage(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="luxury-card"
                        style={{
                            background: '#fff',
                            padding: '2rem',
                            maxWidth: '400px',
                            textAlign: 'center',
                            borderRadius: '20px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            border: '1px solid #fed7d7'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#fff5f5',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#e53e3e'
                        }}>
                            <Zap size={30} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.8rem', color: '#1a1a1a' }}>
                            {alertMessage.title}
                        </h3>
                        <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '2rem' }}>
                            {alertMessage.message}
                        </p>
                        <button
                            onClick={() => setAlertMessage(null)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#1a1a1a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {t('dashboard.adminForms.actions.gotIt')}
                        </button>
                    </motion.div>
                </div>
            )}

            {selectedForm && (
                <EditEventModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedForm(null);
                    }}
                    form={selectedForm}
                    userRole={currentUser?.role || 'admin'}
                    onSuccess={() => {
                        loadForms();
                        setIsEditModalOpen(false);
                        setSelectedForm(null);
                    }}
                />
            )}
        </div>
    );
}
