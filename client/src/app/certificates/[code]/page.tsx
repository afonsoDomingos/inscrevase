'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Award, CheckCircle, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Certificate {
    _id: string;
    code: string;
    hours: number;
    completedLessons: number;
    type: string;
    issuedAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function CertificateValidationPage() {
    const params = useParams();
    const code = params.code as string;
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCertificate = useCallback(async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/certificates/${code}`
                : `http://localhost:5000/api/certificates/${code}`;
            const response = await axios.get(url);
            setCertificate(response.data);
        } catch (err) {
            console.error('Error fetching certificate:', err);
            setError('Certificado não encontrado ou inválido.');
        } finally {
            setLoading(false);
        }
    }, [code]);

    useEffect(() => {
        if (code) {
            fetchCertificate();
        }
    }, [code, fetchCertificate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Certificado não encontrado</h1>
                    <p className="text-gray-600 mb-6">{error || 'O código informado não corresponde a um certificado válido.'}</p>
                    <a href="/" className="text-yellow-600 font-semibold hover:underline">Voltar para a Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

            {/* Validation Banner */}
            <div className="max-w-3xl w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3 shadow-sm">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                    <h3 className="text-green-800 font-bold text-sm uppercase tracking-wide">Certificado Válido</h3>
                    <p className="text-green-700 text-sm">Este documento foi emitido oficialmente pela plataforma Inscreva-se.</p>
                </div>
            </div>

            {/* Certificate Display */}
            <div className="bg-white max-w-4xl w-full shadow-2xl rounded-xl overflow-hidden relative print:shadow-none print:max-w-none print:w-[297mm] print:h-[210mm] print:fixed print:top-0 print:left-0">
                {/* Border/Frame */}
                <div className="absolute inset-0 border-[10px] border-double border-yellow-600/20 pointer-events-none z-10 m-2 rounded-lg"></div>

                <div className="p-12 md:p-20 text-center relative z-0">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-100">
                            <Award className="text-yellow-600" size={48} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">Certificado de Conclusão</h1>
                        <p className="text-gray-500 uppercase tracking-[0.2em] text-sm">Academia Inscreva-se</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 mb-16">
                        <p className="text-xl md:text-2xl text-gray-700">
                            Certificamos que
                        </p>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-yellow-600 py-2 border-b-2 border-gray-100 inline-block px-8">
                            {certificate.user.name}
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto mt-6">
                            concluiu com êxito o programa de treinamento para mentores, demonstrando dedicação e comprometimento com a excelência no ensino.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-16 pt-8 border-t border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                                <Calendar size={16} />
                                <span className="text-xs uppercase tracking-wider">Data de Emissão</span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {format(new Date(certificate.issuedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                                <BookOpen size={16} />
                                <span className="text-xs uppercase tracking-wider">Carga Horária</span>
                            </div>
                            <p className="font-semibold text-gray-900">{certificate.hours} horas</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                                <Award size={16} />
                                <span className="text-xs uppercase tracking-wider">Código de Validação</span>
                            </div>
                            <p className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block text-sm">
                                {certificate.code}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center items-end mt-12 opacity-80">
                        <div className="text-center">
                            <div className="w-48 border-b border-gray-400 mb-2 mx-auto"></div>
                            <p className="font-serif italic text-gray-600">Equipe Inscreva-se</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Print Button */}
            <div className="mt-8 flex gap-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-black transition-colors flex items-center gap-2"
                >
                    Imprimir / Salvar PDF
                </button>
            </div>
        </div>
    );
}
