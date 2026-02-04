"use client";

import { useEffect, useState } from 'react';
import { submissionService, SubmissionModel } from '@/lib/submissionService';
import {
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    Download,
    Calendar,
    Search,
    DollarSign,
    MessageCircle,
    Copy,
    ExternalLink,
    Sparkles,
    AlertTriangle,
    ShieldCheck,
    Loader2,
    Trash2,
    Award,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    BarChart3
} from 'lucide-react';
import { stripeService } from '@/lib/stripeService';
import { lessonService } from '@/lib/lessonService';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslate } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { generateCertificate } from '@/lib/certificateGenerator';

interface SubmissionManagementProps {
    formId?: string | null;
}

interface StudentProgress {
    submissionId: string;
    stats: {
        completed: number;
        total: number;
        percentage: number;
    };
    progress: Array<{
        _id: string;
        title: string;
        order: number;
        completed: boolean;
        completedAt: string;
        watchTime?: number;
    }>;
}

export default function SubmissionManagement({ formId }: SubmissionManagementProps) {
    const { t, locale } = useTranslate();
    const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionModel | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            const data = await submissionService.getMySubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await submissionService.updateStatus(id, status);
            setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
            if (selectedSubmission?._id === id) {
                setSelectedSubmission({ ...selectedSubmission, status });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(t('common.updateStatusError'));
        }
    };

    const handleAnalyzeReceipt = async (submissionId: string) => {
        setAnalyzingId(submissionId);
        try {
            const result = await submissionService.analyzeReceipt(submissionId);
            setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, aiAnalysis: result.analysis } : s));
            if (selectedSubmission?._id === submissionId) {
                setSelectedSubmission({ ...selectedSubmission, aiAnalysis: result.analysis });
            }
            toast.success(t('events.submissions.aiAnalysisDone'));
        } catch (error) {
            console.error('Error analyzing receipt:', error);
            toast.error(t('common.toasts.generalError'));
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleViewProgress = async (submissionId: string) => {
        setLoadingProgress(true);
        try {
            const progress = await lessonService.getStudentProgress(submissionId);
            setStudentProgress({ ...progress, submissionId });
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error(t('events.submissions.studentProgressError'));
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleRefund = async (id: string) => {
        if (confirm(t('events.submissions.refundConfirm'))) {
            try {
                toast.loading(t('events.submissions.processingRefund'));
                await stripeService.refundPayment(id);
                setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status: 'rejected', paymentStatus: 'refunded' } : s));
                toast.dismiss();
                toast.success(t('events.submissions.refundSuccess'));
            } catch (error: unknown) {
                toast.dismiss();
                console.error('Error refunding payment:', error);
                toast.error(error instanceof Error ? error.message : t('events.submissions.refundError'));
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('events.submissions.deleteConfirm'))) {
            try {
                await submissionService.deleteSubmission(id);
                setSubmissions(prev => prev.filter(s => s._id !== id));
                toast.success(t('common.toasts.deleteSuccess'));
                if (selectedSubmission?._id === id) setSelectedSubmission(null);
            } catch (error) {
                console.error('Error deleting submission:', error);
                toast.error(t('common.toasts.deleteError'));
            }
        }
    };

    const getMainIdentifier = (data: Record<string, unknown>) => {
        if (!data) return t('events.noIdentification');
        const keys = Object.keys(data);
        if (keys.length === 0) return t('events.noIdentification');

        const nameKey = keys.find(k =>
            k.toLowerCase().includes('nome') ||
            k.toLowerCase().includes('name') ||
            k.toLowerCase() === 'n'
        );

        if (nameKey) return String(data[nameKey]);
        return String(data[keys[0]]) || t('events.noIdentification');
    };

    const getEmailIdentifier = (data: Record<string, unknown>) => {
        if (!data) return null;
        const keys = Object.keys(data);

        const emailKey = keys.find(k =>
            k.toLowerCase().includes('email') ||
            k.toLowerCase().includes('mail')
        );

        return emailKey ? String(data[emailKey]) : null;
    };

    const getPhoneIdentifier = (data: Record<string, unknown>) => {
        if (!data) return null;
        const keys = Object.keys(data);
        const phoneKey = keys.find(k =>
            k.toLowerCase().includes('tel') ||
            k.toLowerCase().includes('cel') ||
            k.toLowerCase().includes('zap') ||
            k.toLowerCase().includes('phone') ||
            k.toLowerCase().includes('contato') ||
            k.toLowerCase().includes('telemovel')
        );
        return phoneKey ? String(data[phoneKey]) : null;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesForm = formId ? s.form?._id === formId : true;
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const identifier = String(getMainIdentifier(s.data)).toLowerCase();
        const matchesSearch = identifier.includes(searchTerm.toLowerCase()) ||
            (s.form?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesForm && matchesStatus && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchTerm]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('events.loading')}</div>;

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder={t('events.submissions.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-luxury"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                background: filterStatus === status ? '#000' : '#fff',
                                color: filterStatus === status ? '#FFD700' : '#666',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status === 'all' ? t('events.submissions.all') : status === 'pending' ? t('events.submissions.pending') : status === 'approved' ? t('events.submissions.approved') : t('events.submissions.rejected')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="luxury-card" style={{ background: '#fff', border: 'none', padding: 0, overflow: 'hidden' }}>
                {filteredSubmissions.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                        <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>{t('events.submissions.noSubmissions')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div style={{ overflowX: 'auto' }} className="desktop-table">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', textAlign: 'left', fontSize: '0.75rem', color: '#666' }}>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '150px' }}>{t('events.submissions.registrant')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '110px' }}>{t('events.submissions.contact')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '130px' }}>{t('events.submissions.event')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '100px' }}>{t('events.submissions.date')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '100px' }}>{t('events.submissions.proof')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '90px' }}>{t('events.submissions.status')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '120px', textAlign: 'center' }}>{t('events.submissions.registration')}</th>
                                        <th style={{ padding: '0.6rem 0.8rem', minWidth: '160px', textAlign: 'right' }}>{t('events.submissions.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSubmissions.map(submission => (
                                        <tr key={submission._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                <div style={{ fontWeight: 700, color: '#000', fontSize: '0.9rem' }}>{getMainIdentifier(submission.data)}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{getEmailIdentifier(submission.data) || '---'}</div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
                                                    {getPhoneIdentifier(submission.data) || '---'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{submission.form.title}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#999' }}>/{submission.form.slug}</div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#666' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {formatDate(submission.submittedAt)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                {submission.paymentProof ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <button
                                                            onClick={() => setSelectedProof(submission.paymentProof!)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            <Eye size={14} /> {t('events.submissions.view')}
                                                        </button>
                                                        {submission.aiAnalysis ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 800, color: submission.aiAnalysis.isValid ? '#10b981' : '#ef4444' }}>
                                                                <Sparkles size={10} /> IA: {submission.aiAnalysis.isValid ? t('events.submissions.aiStatusValid') : t('events.submissions.aiStatusSuspect')}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                disabled={analyzingId === submission._id}
                                                                onClick={() => handleAnalyzeReceipt(submission._id)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 800, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                {analyzingId === submission._id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} {t('events.submissions.analyzeAi')}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#999', fontSize: '0.8rem' }}>{t('events.submissions.noAttachment')}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    background: submission.paymentStatus === 'refunded' ? '#71809615' : submission.status === 'approved' ? '#38a16915' : submission.status === 'rejected' ? '#e53e3e15' : '#d69e2e15',
                                                    color: submission.paymentStatus === 'refunded' ? '#718096' : submission.status === 'approved' ? '#38a169' : submission.status === 'rejected' ? '#e53e3e' : '#d69e2e'
                                                }}>
                                                    {submission.paymentStatus === 'refunded' ? t('events.submissions.refundedLabel') : submission.status === 'approved' ? t('events.submissions.approvedLabel') : submission.status === 'rejected' ? t('events.submissions.rejectedLabel') : t('events.submissions.pendingLabel')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => setSelectedSubmission(submission)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                            padding: '0.5rem 1rem', borderRadius: '8px',
                                                            border: 'none', background: '#f4f4f4',
                                                            color: '#000', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewProgress(submission._id)}
                                                        disabled={submission.status !== 'approved'}
                                                        title={submission.status !== 'approved' ? t('events.submissions.approveToViewProgress') : t('events.submissions.viewProgress')}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                            padding: '0.5rem 1rem', borderRadius: '8px',
                                                            border: '1px solid var(--gold-active)', background: 'transparent',
                                                            color: '#D4AF37', cursor: submission.status !== 'approved' ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 800,
                                                            opacity: submission.status !== 'approved' ? 0.3 : 1
                                                        }}
                                                    >
                                                        {loadingProgress ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />} {t('events.submissions.progress')}
                                                    </button>
                                                    <a
                                                        href={`/hub/${submission._id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                            padding: '0.5rem 1rem', borderRadius: '8px',
                                                            border: 'none', background: '#000',
                                                            color: '#FFD700', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
                                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <ExternalLink size={14} /> HUB
                                                    </a>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleUpdateStatus(submission._id, 'approved')}
                                                        title={t('events.submissions.approveTooltip')}
                                                        disabled={submission.status === 'approved'}
                                                        style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: submission.status === 'approved' ? '#eee' : '#38a169', color: '#fff', cursor: submission.status === 'approved' ? 'default' : 'pointer' }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(submission._id, 'rejected')}
                                                        title={t('events.submissions.rejectTooltip')}
                                                        disabled={submission.status === 'rejected'}
                                                        style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: submission.status === 'rejected' ? '#eee' : '#e53e3e', color: '#fff', cursor: submission.status === 'rejected' ? 'default' : 'pointer' }}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    {submission.status === 'approved' && (
                                                        <button
                                                            onClick={() => {
                                                                generateCertificate({
                                                                    participantName: String(getMainIdentifier(submission.data)),
                                                                    eventTitle: submission.form.title,
                                                                    date: new Date(submission.submittedAt).toLocaleDateString(),
                                                                    mentorName: 'Mentor Oficial',
                                                                    id: submission._id
                                                                });
                                                            }}
                                                            title={t('events.submissions.downloadCertificate')}
                                                            style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: '#D4AF37', color: '#000', cursor: 'pointer' }}
                                                        >
                                                            <Award size={16} />
                                                        </button>
                                                    )}
                                                    {submission.paymentMethod === 'stripe' && submission.paymentStatus !== 'refunded' && (
                                                        <button
                                                            onClick={() => handleRefund(submission._id)}
                                                            title={t('events.submissions.refunding')}
                                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #718096', background: '#fff', color: '#718096', cursor: 'pointer' }}
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(submission._id)}
                                                        title={t('events.submissions.deleteSubmission')}
                                                        style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #ffcccb', background: '#fff', color: '#e53e3e', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{
                                padding: '1rem',
                                borderTop: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#f8f9fa'
                            }}>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {t('events.submissions.showing')} {startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} {t('events.submissions.of')} {filteredSubmissions.length} {t('dashboard.submissions')}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            background: currentPage === 1 ? '#f0f0f0' : '#fff',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            opacity: currentPage === 1 ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '80px', textAlign: 'center' }}>
                                        {t('events.submissions.page')} {currentPage} {t('events.submissions.of')} {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            background: currentPage === totalPages ? '#f0f0f0' : '#fff',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            opacity: currentPage === totalPages ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Cards */}
                        <div className="mobile-cards" style={{ display: 'none' }}>
                            {paginatedSubmissions.map(submission => (
                                <div key={submission._id} style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{getMainIdentifier(submission.data)}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{getEmailIdentifier(submission.data) || '---'}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{getPhoneIdentifier(submission.data) || '---'}</div>
                                        </div>
                                        <span style={{
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: submission.paymentStatus === 'refunded' ? '#71809615' : submission.status === 'approved' ? '#38a16915' : submission.status === 'rejected' ? '#e53e3e15' : '#d69e2e15',
                                            color: submission.paymentStatus === 'refunded' ? '#718096' : submission.status === 'approved' ? '#38a169' : submission.status === 'rejected' ? '#e53e3e' : '#d69e2e'
                                        }}>
                                            {submission.paymentStatus === 'refunded' ? t('events.submissions.refundedLabel') : submission.status === 'approved' ? t('events.submissions.approvedLabel') : submission.status === 'rejected' ? t('events.submissions.rejectedLabel') : t('events.submissions.pendingLabel')}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                                        <strong>{t('events.submissions.event')}:</strong> {submission.form.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                                        <strong>{t('events.submissions.date')}:</strong> {formatDate(submission.submittedAt)}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedSubmission(submission)}
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                background: '#f4f4f4',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Eye size={16} /> {t('events.submissions.viewDetails')}
                                        </button>
                                        <a
                                            href={`/hub/${submission._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#000',
                                                color: '#FFD700',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <ExternalLink size={16} /> HUB
                                        </a>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => handleUpdateStatus(submission._id, 'approved')}
                                            disabled={submission.status === 'approved'}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: submission.status === 'approved' ? '#eee' : '#38a169',
                                                color: '#fff',
                                                cursor: submission.status === 'approved' ? 'default' : 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <CheckCircle size={16} /> {t('events.submissions.approve')}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(submission._id, 'rejected')}
                                            disabled={submission.status === 'rejected'}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: submission.status === 'rejected' ? '#eee' : '#e53e3e',
                                                color: '#fff',
                                                cursor: submission.status === 'rejected' ? 'default' : 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <XCircle size={16} /> {t('events.submissions.reject')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(submission._id)}
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e53e3e',
                                                background: '#fff',
                                                color: '#e53e3e',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Payment Proof Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedSubmission(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '600px',
                                maxHeight: '90vh', background: '#fff', borderRadius: '24px',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <div style={{
                                padding: '1.5rem 2rem', background: '#000', color: '#fff',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-playfair)' }}>
                                        {t('events.submissions.details')}
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 600 }}>
                                        {selectedSubmission.form.title}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                        #{selectedSubmission._id.slice(-8).toUpperCase()} • {formatDate(selectedSubmission.submittedAt)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => {
                                            const text = Object.entries(selectedSubmission.data || {})
                                                .map(([k, v]) => `${k}: ${v}`).join('\n');
                                            navigator.clipboard.writeText(text);
                                            toast.success(t('events.submissions.copySuccess'));
                                        }}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFD700', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                        <Copy size={14} /> {t('events.submissions.copyBtn')}
                                    </button>
                                    <button
                                        onClick={() => setSelectedSubmission(null)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                                        <div key={key} style={{ padding: '1.2rem', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #eee', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#999', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                                                        {key}
                                                    </label>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#000', wordBreak: 'break-word' }}>
                                                        {String(value)}
                                                    </div>
                                                </div>

                                                {(key.toLowerCase().includes('tel') || key.toLowerCase().includes('cel') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('zap') || key.toLowerCase().includes('contato')) && (
                                                    <a
                                                        href={`https://wa.me/${String(value).replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ background: '#25D366', color: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Chamar no WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedSubmission.aiAnalysis && (
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1.5rem',
                                        background: selectedSubmission.aiAnalysis.isValid ? '#f0fdf4' : '#fef2f2',
                                        borderRadius: '20px',
                                        border: `1px solid ${selectedSubmission.aiAnalysis.isValid ? '#bbf7d0' : '#fecaca'}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
                                            <Sparkles size={40} />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                            <Sparkles size={18} color={selectedSubmission.aiAnalysis.isValid ? '#10b981' : '#ef4444'} />
                                            <h4 style={{ fontWeight: 800, color: selectedSubmission.aiAnalysis.isValid ? '#166534' : '#991b1b', fontSize: '0.9rem' }}>{t('events.submissions.aiAnalysisTitle')}</h4>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>{t('events.submissions.transactionId')}</div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedSubmission.aiAnalysis.transactionId || '---'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>{t('events.submissions.identifiedValue')}</div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedSubmission.aiAnalysis.amount} {selectedSubmission.aiAnalysis.currency}</div>
                                            </div>
                                        </div>

                                        {selectedSubmission.aiAnalysis.warning && (
                                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                                                <p style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>{selectedSubmission.aiAnalysis.warning}</p>
                                            </div>
                                        )}

                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('events.submissions.aiConfidence')}: <b>{selectedSubmission.aiAnalysis.confidence}%</b></div>
                                            {selectedSubmission.aiAnalysis.isValid && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}><ShieldCheck size={14} /> {t('events.submissions.verifiedLabel')}</div>}
                                        </div>
                                    </div>
                                )}

                                {selectedSubmission.paymentProof && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,215,0,0.05)', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                            <DollarSign size={20} className="gold-text" />
                                            <h4 style={{ fontWeight: 800 }}>{t('events.submissions.paymentProof')}</h4>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const proof = selectedSubmission.paymentProof;
                                                setSelectedSubmission(null);
                                                setTimeout(() => setSelectedProof(proof!), 300);
                                            }}
                                            style={{
                                                width: '100%', padding: '0.8rem', borderRadius: '10px',
                                                border: '1px solid #000', background: '#000', color: '#FFD700',
                                                fontWeight: 700, cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', gap: '8px'
                                            }}
                                        >
                                            <Eye size={18} /> {t('events.submissions.view')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        const phone = getPhoneIdentifier(selectedSubmission.data);
                                        const name = getMainIdentifier(selectedSubmission.data);
                                        const eventTitle = selectedSubmission.form.title;
                                        const hubLink = `${window.location.protocol}//${window.location.host}/hub/${selectedSubmission._id}`;

                                        const message = encodeURIComponent(`Olá ${name}, a tua vaga na *${eventTitle}* está confirmada! 🎉\n\nAqui está o teu QR Code de entrada e detalhes do evento 🎟️:\n${hubLink}\n\nPrepare-se para uma experiência incrível!`);
                                        window.open(`https://wa.me/${String(phone).replace(/\D/g, '')}?text=${message}`, '_blank');
                                    }}
                                    style={{
                                        flex: 2, padding: '0.8rem', borderRadius: '10px',
                                        border: '1px solid #25D366', background: '#25D366',
                                        color: '#fff', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <MessageCircle size={18} /> WhatsApp Pro
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(selectedSubmission._id, 'approved');
                                        setSelectedSubmission(null);
                                    }}
                                    disabled={selectedSubmission.status === 'approved'}
                                    style={{
                                        flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none',
                                        background: selectedSubmission.status === 'approved' ? '#eee' : '#38a169',
                                        color: '#fff', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {t('events.submissions.approve')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(selectedSubmission._id, 'rejected');
                                        setSelectedSubmission(null);
                                    }}
                                    disabled={selectedSubmission.status === 'rejected'}
                                    style={{
                                        flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none',
                                        background: selectedSubmission.status === 'rejected' ? '#eee' : '#e53e3e',
                                        color: '#fff', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {t('events.submissions.reject')}
                                </button>
                            </div>
                            {selectedSubmission.paymentMethod === 'stripe' && selectedSubmission.paymentStatus !== 'refunded' && (
                                <div style={{ padding: '0 2rem 1.5rem' }}>
                                    <button
                                        onClick={() => {
                                            handleRefund(selectedSubmission._id);
                                            setSelectedSubmission(null);
                                        }}
                                        style={{
                                            width: '100%', padding: '0.8rem', borderRadius: '10px',
                                            border: '1px solid #718096', background: '#fff',
                                            color: '#718096', fontWeight: 700, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <RotateCcw size={18} /> Reembolsar Integralmente (Stripe)
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {selectedProof && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedProof(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '90vh', background: '#fff', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('events.submissions.proofTitle')}</h3>
                                <button onClick={() => setSelectedProof(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px', position: 'relative', minHeight: '600px' }}>
                                {selectedProof.toLowerCase().endsWith('.pdf') || selectedProof.toLowerCase().includes('.pdf') ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                                        {/* PDF Icon and Info */}
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                background: '#ef4444',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 1rem',
                                                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                                            }}>
                                                <FileText size={40} color="#fff" />
                                            </div>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000' }}>
                                                Comprovativo em PDF
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', color: '#666', maxWidth: '400px', margin: '0 auto' }}>
                                                Por questões de segurança, alguns navegadores bloqueiam PDFs inline. Clique no botão abaixo para visualizar.
                                            </p>
                                        </div>

                                        {/* Primary Action Buttons */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                                            <a
                                                href={selectedProof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '1rem 2rem',
                                                    background: '#000',
                                                    color: '#FFD700',
                                                    borderRadius: '12px',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
                                            >
                                                <Eye size={20} /> Abrir PDF em Nova Aba
                                            </a>

                                            <a
                                                href={selectedProof}
                                                download
                                                style={{
                                                    padding: '1rem 2rem',
                                                    background: '#fff',
                                                    color: '#000',
                                                    border: '2px solid #000',
                                                    borderRadius: '12px',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#f8f8f8'}
                                                onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.background = '#fff'}
                                            >
                                                <Download size={20} /> Baixar PDF
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
                                        <Image src={selectedProof} alt="Comprovativo" fill style={{ objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <a href={selectedProof} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <Download size={16} /> {t('events.submissions.downloadOriginal')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Student Progress Modal */}
            <AnimatePresence>
                {studentProgress && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setStudentProgress(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '700px',
                                maxHeight: '85vh', background: '#fff', borderRadius: '32px',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ padding: '2rem', background: '#0a0a0a', color: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Acompanhamento de Aluno</h3>
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{getMainIdentifier(paginatedSubmissions.find(s => s._id === studentProgress.submissionId)?.data || {})}</p>
                                    </div>
                                    <button onClick={() => setStudentProgress(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                                </div>

                                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{studentProgress.stats.completed}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>Concluídas</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{studentProgress.stats.total - studentProgress.stats.completed}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>Pendentes</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,215,0,0.1)', padding: '1.2rem', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,215,0,0.2)' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>{Math.round(studentProgress.stats.percentage)}%</div>
                                        <div style={{ fontSize: '0.75rem', color: '#FFD700', textTransform: 'uppercase' }}>Avanço Total</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                                {studentProgress.progress.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Nenhuma aula vinculada a este evento.</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {studentProgress.progress.map((p) => (
                                            <div key={p._id} style={{ padding: '1.2rem', borderRadius: '20px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: p.completed ? '#10b98115' : '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.completed ? '#10b981' : '#999' }}>
                                                    {p.completed ? <CheckCircle size={20} /> : <div style={{ fontWeight: 800 }}>{p.order}</div>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                        {p.completed ? `Finalizada em ${new Date(p.completedAt).toLocaleDateString()}` : 'Não iniciada'}
                                                    </div>
                                                </div>
                                                {(p.watchTime ?? 0) > 0 && (
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, background: '#f8f9fa', padding: '4px 10px', borderRadius: '6px' }}>
                                                        {Math.floor((p.watchTime ?? 0) / 60)}m assistidos
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .desktop-table {
                        display: block !important;
                    }
                    .mobile-cards {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .desktop-table {
                        display: none !important;
                    }
                    .mobile-cards {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
