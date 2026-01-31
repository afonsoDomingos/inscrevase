'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Certificate {
    _id: string;
    code: string;
    hours: number;
    completedLessons: number;
    type: string;
    issuedAt: string;
    user: string;
}

export default function MyCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/my-certificates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCertificates(response.data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-yellow-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Award className="text-yellow-600" size={32} />
                    Meus Certificados
                </h1>
                <p className="text-gray-600">
                    Visualize e baixe seus certificados de conclusão.
                </p>
            </div>

            {certificates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Award size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum certificado ainda</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Complete aulas e cursos para ganhar certificados de reconhecimento.
                        Continue estudando!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <motion.div
                            key={cert._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all"
                        >
                            <div className="h-32 bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 relative overflow-hidden">
                                <Award className="text-white opacity-20 absolute -right-4 -bottom-4" size={96} />
                                <div className="relative z-10">
                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        CERTIFICADO DE PARTICIPAÇÃO
                                    </span>
                                    <h3 className="text-white text-xl font-bold mt-2">
                                        Academia Inscreva-se
                                    </h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                                    <Calendar size={16} />
                                    <span>Emitido em {format(new Date(cert.issuedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Carga Horária:</span>
                                        <span className="font-semibold">{cert.hours} horas</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Aulas:</span>
                                        <span className="font-semibold">{cert.completedLessons}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Código:</span>
                                        <span className="font-mono bg-gray-100 px-2 rounded text-xs py-0.5">{cert.code}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <a
                                        href={`/certificates/${cert.code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 py-2 rounded-lg hover:bg-yellow-100 transition-colors font-medium text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Visualizar
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
