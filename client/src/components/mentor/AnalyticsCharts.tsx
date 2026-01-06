"use client";

import { useEffect, useState } from 'react';
import { dashboardService, AnalyticsData } from '@/lib/dashboardService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Loader2, TrendingUp, MapPin } from 'lucide-react';

export default function AnalyticsCharts() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const result = await dashboardService.getAnalytics();
                setData(result);
            } catch (error) {
                console.error("Dashboard analytics error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                <Loader2 className="animate-spin" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                Carregando dados analíticos...
            </div>
        );
    }

    if (!data) return null;

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Chart 1: Evolution */}
            <div className="luxury-card" style={{ background: '#fff', border: 'none', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.8rem', background: '#FFD70020', borderRadius: '10px', color: '#B8860B' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Evolução de Inscrições</h3>
                        <p style={{ color: '#666', fontSize: '0.85rem' }}>Últimos 7 dias</p>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#888' }}
                                stroke="#ddd"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#888' }} stroke="#ddd" />
                            <Tooltip
                                contentStyle={{ background: '#000', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#FFD700' }}
                                labelStyle={{ color: '#888', marginBottom: '0.5rem' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="url(#gradientStroke)"
                                strokeWidth={4}
                                dot={{ fill: '#FFD700', strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 8, fill: '#fff', stroke: '#FFD700', strokeWidth: 2 }}
                            />
                            <defs>
                                <linearGradient id="gradientStroke" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#FFD700" />
                                    <stop offset="100%" stopColor="#B8860B" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Geo Distribution */}
            <div className="luxury-card" style={{ background: '#fff', border: 'none', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.8rem', background: '#3182ce20', borderRadius: '10px', color: '#3182ce' }}>
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Origem dos Participantes</h3>
                        <p style={{ color: '#666', fontSize: '0.85rem' }}>Top províncias (baseado nos dados do formulário)</p>
                    </div>
                </div>

                {data.geoStats.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.geoStats} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 12, fill: '#333', fontWeight: 600 }}
                                    width={100}
                                    stroke="transparent"
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#000', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.geoStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FFD700' : '#E5C100'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#999', border: '2px dashed #eee', borderRadius: '12px' }}>
                        <p>Ainda não há dados geográficos suficientes.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Certifique-se de que seus formulários perguntam a "Província" ou "Cidade".</p>
                    </div>
                )}
            </div>
        </div>
    );
}
