"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { publicService, PublicImpactStats } from '@/lib/publicService';
import { MapPin, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
                            {stats?.topMentors && stats.topMentors.length > 0 ? (
                                stats.topMentors.map((mentor, index) => (
                                    <div key={mentor.id} className="mentor-item">
                                        <div className="mentor-info">
                                            <div className="mentor-avatar-wrapper">
                                                {mentor.profilePhoto ? (
                                                    <Image
                                                        src={mentor.profilePhoto}
                                                        alt={mentor.name}
                                                        width={44}
                                                        height={44}
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
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                                    Ainda sem dados de mentores.
                                </div>
                            )}
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
                            {stats?.topCountries && stats.topCountries.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.topCountries} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="country"
                                            type="category"
                                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: '#fff' }}
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {stats?.topCountries.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index < 3 ? 'url(#goldGradient)' : 'rgba(255,255,255,0.15)'} />
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
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                    Ainda sem dados de geolocalização.
                                </div>
                            )}
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

                {/* Impact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        marginTop: '80px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    <h3 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '30px',
                        fontFamily: 'Playfair Display, serif',
                        color: '#fff'
                    }}>
                        Pronto para deixar a sua <span className="gold-text">Marca no Mundo?</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/cadastro" style={{
                            background: 'var(--gold-gradient)',
                            color: '#000',
                            padding: '16px 40px',
                            borderRadius: '50px',
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            boxShadow: '0 10px 30px rgba(212,175,55,0.3)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                            className="hover-scale"
                        >
                            Quero Ser Mentor <Award size={20} />
                        </Link>
                        <Link href="/explorar" style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            padding: '16px 40px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease'
                        }}
                            className="hover-opacity"
                        >
                            Explorar Eventos
                        </Link>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .impact-section {
                    background: #000000;
                    color: #ffffff;
                    padding: 120px 0;
                    position: relative;
                    overflow: hidden;
                }

                .bg-mesh-overlay {
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                }

                .impact-header {
                    text-align: center;
                    margin-bottom: 80px;
                    position: relative;
                    z-index: 2;
                }

                .impact-title {
                    font-size: clamp(3rem, 6vw, 4.5rem);
                    font-weight: 900;
                    margin-bottom: 24px;
                    font-family: 'Playfair Display', serif;
                    color: #ffffff;
                    letter-spacing: -1px;
                }

                .gold-text {
                    background: linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    display: inline-block;
                }

                .impact-subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1.25rem;
                    max-width: 800px;
                    margin: 0 auto;
                    line-height: 1.7;
                    font-family: 'Inter', sans-serif;
                }

                .impact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 40px;
                    align-items: start;
                    position: relative;
                    z-index: 2;
                }

                .impact-card {
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    border-radius: 40px;
                    padding: 48px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .impact-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(212, 175, 55, 0.4);
                    box-shadow: 0 35px 70px -15px rgba(212, 175, 55, 0.1);
                }

                .card-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 35px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-family: 'Playfair Display', serif;
                    color: #ffffff;
                }

                .icon-gold {
                    color: #FFD700;
                    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
                }

                .mentors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .mentor-item {
                    width: 100%;
                }

                .mentor-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .mentor-avatar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .mentor-avatar {
                    border-radius: 50%;
                    border: 2px solid rgba(255, 215, 0, 0.5);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
                }

                .mentor-initial {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #FFD700;
                    border: 2px solid rgba(255, 215, 0, 0.3);
                }

                .mentor-name-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .mentor-name {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.9);
                }

                .mentor-name.highlight {
                    color: #FFD700;
                    text-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                }

                .mentor-score {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .progress-bar-bg {
                    height: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .progress-bar-fill {
                    height: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                }

                .progress-bar-fill.first {
                    background: linear-gradient(90deg, #FFD700, #FDB931, #B8860B);
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
                }

                .card-subtitle-small {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 30px;
                    font-weight: 500;
                }

                .chart-container {
                    height: 320px;
                    margin-bottom: 40px;
                }

                .counters-box {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 30px;
                }

                .counter-item {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 24px 12px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .counter-item.featured {
                    border-color: rgba(255, 215, 0, 0.3);
                    background: rgba(255, 215, 0, 0.05);
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.05);
                }

                .counter-value {
                    font-size: 1.75rem;
                    font-weight: 900;
                    margin-bottom: 8px;
                    color: #ffffff;
                }

                .counter-item.featured .counter-value {
                    background: linear-gradient(135deg, #FFD700, #FDB931);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .counter-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 800;
                }

                @media (max-width: 768px) {
                    .impact-grid {
                        grid-template-columns: 1fr;
                    }
                    .impact-card {
                        padding: 30px;
                    }
                    .counter-value {
                        font-size: 1.4rem;
                    }
                    .impact-title {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </section>
    );
}
