"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { publicService, PublicImpactStats } from '@/lib/publicService';
import { MapPin, Award } from 'lucide-react';
import Image from 'next/image';
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

    if (loading) return null;

    return (
        <section className="impact-section">
            <div className="bg-mesh-overlay"></div>

            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="impact-header"
                >
                    <h2 className="impact-title">
                        Impacto <span className="gold-text">Global</span>
                    </h2>
                    <p className="impact-subtitle">
                        Veja como a nossa comunidade está transformando o conhecimento em resultados reais ao redor do mundo.
                    </p>
                </motion.div>

                <div className="impact-grid">

                    {/* Top Mentors Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="impact-card"
                    >
                        <h3 className="card-title">
                            <Award className="icon-gold" size={24} /> Top Mentores de Elite
                        </h3>
                        <div className="mentors-list">
                            {stats?.topMentors.map((mentor, index) => (
                                <div key={mentor.id} className="mentor-item">
                                    <div className="mentor-info">
                                        <div className="mentor-avatar-wrapper">
                                            {mentor.profilePhoto ? (
                                                <Image
                                                    src={mentor.profilePhoto}
                                                    alt={mentor.name}
                                                    width={40}
                                                    height={40}
                                                    className="mentor-avatar"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="mentor-initial">{mentor.name[0]}</div>
                                            )}
                                        </div>
                                        <div className="mentor-name-group">
                                            <span className={`mentor-name ${index === 0 ? 'highlight' : ''}`}>
                                                {mentor.name}
                                            </span>
                                            <span className="mentor-score">{mentor.impactScore.toLocaleString()} pts</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(mentor.impactScore / (stats.topMentors[0].impactScore || 1)) * 100}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 }}
                                            className={`progress-bar-fill ${index === 0 ? 'first' : ''}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Global Activity Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="impact-card"
                    >
                        <h3 className="card-title">
                            <MapPin className="icon-gold" size={24} /> Alcance Global
                        </h3>
                        <p className="card-subtitle-small">Países com maior atividade na plataforma</p>

                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.topCountries} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="country"
                                        type="category"
                                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {stats?.topCountries.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? 'url(#goldGradient)' : '#333'} />
                                        ))}
                                    </Bar>
                                    <defs>
                                        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#FFD700" />
                                            <stop offset="100%" stopColor="#B8860B" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="counters-box">
                            <div className="counter-item">
                                <div className="counter-value">{stats?.globalStats.totalSubmissions.toLocaleString()}</div>
                                <div className="counter-label">Inscrições</div>
                            </div>
                            <div className="counter-item featured">
                                <div className="counter-value">{stats?.globalStats.totalVisits.toLocaleString()}</div>
                                <div className="counter-label">Visitas</div>
                            </div>
                            <div className="counter-item">
                                <div className="counter-value">{stats?.globalStats.totalMentors.toLocaleString()}</div>
                                <div className="counter-label">Mentores</div>
                            </div>
                        </div>

                    </motion.div>

                </div>
            </div>

            <style jsx>{`
                .impact-section {
                    background: #050505;
                    color: #ffffff;
                    padding: 100px 0;
                    position: relative;
                    overflow: hidden;
                }

                .bg-mesh-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                }

                .impact-header {
                    text-align: center;
                    margin-bottom: 70px;
                }

                .impact-title {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 900;
                    margin-bottom: 20px;
                    font-family: 'Playfair Display', serif;
                }

                .impact-subtitle {
                    color: #888;
                    font-size: 1.2rem;
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                .impact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 40px;
                    align-items: start;
                }

                .impact-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .card-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-family: 'Playfair Display', serif;
                }

                .icon-gold {
                    color: #FFD700;
                }

                .mentors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .mentor-item {
                    width: 100%;
                }

                .mentor-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .mentor-avatar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .mentor-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(255, 215, 0, 0.3);
                }

                .mentor-initial {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #FFD700;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                }

                .mentor-name-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .mentor-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .mentor-name.highlight {
                    color: #FFD700;
                    font-weight: 800;
                }

                .mentor-score {
                    font-size: 0.75rem;
                    color: #666;
                    font-weight: 700;
                }

                .progress-bar-bg {
                    height: 8px;
                    background: #111;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: #444;
                    border-radius: 10px;
                }

                .progress-bar-fill.first {
                    background: linear-gradient(90deg, #FFD700, #B8860B);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                }

                .card-subtitle-small {
                    font-size: 0.85rem;
                    color: #666;
                    margin-bottom: 25px;
                }

                .chart-container {
                    height: 300px;
                    margin-bottom: 30px;
                }

                .counters-box {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 20px;
                }

                .counter-item {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 15px 10px;
                    text-align: center;
                }

                .counter-item.featured {
                    border-color: rgba(255, 215, 0, 0.2);
                    background: rgba(255, 215, 0, 0.03);
                }

                .counter-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin-bottom: 5px;
                }

                .counter-item.featured .counter-value {
                    color: #FFD700;
                }

                .counter-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #666;
                    font-weight: 700;
                }

                @media (max-width: 768px) {
                    .impact-grid {
                        grid-template-columns: 1fr;
                    }
                    .impact-card {
                        padding: 25px;
                    }
                    .counter-value {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </section>
    );
}
