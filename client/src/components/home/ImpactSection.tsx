"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { publicService, PublicImpactStats } from '@/lib/publicService';
import { MapPin, Award } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ImpactSection() {
    const [stats, setStats] = useState<PublicImpactStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await publicService.getImpactStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load impact stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return null; // Or a subtle skeleton

    return (
        <section className="py-20 bg-black text-white relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4 font-playfair tracking-tight">
                        Impacto <span className="text-[#FFD700]">Global</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Veja como a nossa comunidade está transformando o conhecimento em resultados reais ao redor do mundo.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Top Mentors Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10"
                    >
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Award className="text-[#FFD700]" /> Top Mentores de Elite
                        </h3>
                        <div className="space-y-6">
                            {stats?.topMentors.map((mentor, index) => (
                                <div key={mentor.id} className="relative">
                                    <div className="flex items-center justify-between mb-2 text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs border border-white/20 overflow-hidden">
                                                {mentor.profilePhoto ? (
                                                    <img src={mentor.profilePhoto} alt={mentor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    mentor.name[0]
                                                )}
                                            </div>
                                            <span className={index === 0 ? "text-[#FFD700] font-bold" : "text-white"}>
                                                {mentor.name}
                                            </span>
                                        </div>
                                        <span className="text-gray-400">{mentor.impactScore.toLocaleString()} pts</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(mentor.impactScore / (stats.topMentors[0].impactScore || 1)) * 100}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className={`h-full rounded-full ${index === 0 ? "bg-gradient-to-r from-[#FFD700] to-[#E5C100]" : "bg-gray-600"}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Global Reach Map/Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[500px]"
                    >
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 self-start w-full">
                            <MapPin className="text-[#FFD700]" /> Alcance Global
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 self-start">Países com maior atividade na plataforma</p>

                        <div className="w-full h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.topCountries} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="country"
                                        type="category"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        width={40}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {stats?.topCountries.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? '#FFD700' : '#4b5563'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">{stats?.globalStats.totalSubmissions.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Inscrições</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-2xl font-bold text-[#FFD700] mb-1">{stats?.globalStats.totalVisits.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Visitas</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">{stats?.globalStats.totalMentors.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Mentores</div>
                            </div>
                        </div>

                    </motion.div>

                </div>
            </div>
        </section>
    );
}
