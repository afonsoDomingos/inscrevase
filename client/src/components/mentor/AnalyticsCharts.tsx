"use client";

import { useEffect, useState } from 'react';
import { dashboardService, AnalyticsData } from '@/lib/dashboardService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Loader2, TrendingUp, MapPin, Eye, Zap, Globe } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

export default function AnalyticsCharts() {
    const { t } = useTranslate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const result = await dashboardService.getAnalytics();
                setData(result);
            } catch (error) {
                console.error("Dashboard analytics error:", error);
                setError("Falha ao carregar dados analíticos.");
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', marginBottom: '1rem' }} />
                <p>{t('dashboard.analytics.loading') || 'Carregando insights...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#e53e3e', border: '1px dashed #feb2b2', borderRadius: '15px' }}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', background: '#e53e3e', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Tentar Novamente</button>
            </div>
        );
    }

    if (!data) return null;

    // Calculate Global Conversion Rate
    const totalVisits = data.dailyStats.reduce((acc, curr) => acc + (curr.visits || 0), 0);
    const totalSubmissions = data.dailyStats.reduce((acc, curr) => acc + curr.count, 0);
    const conversionRate = totalVisits > 0 ? ((totalSubmissions / totalVisits) * 100).toFixed(1) : 0;

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>

            {/* Summary Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ color: '#FFD700', marginBottom: '0.5rem' }}><Eye size={20} /></div>
                    <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.analytics.totalViews')}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalVisits}</div>
                    <div style={{ fontSize: '0.7rem', color: '#38a169', marginTop: '0.5rem' }}>{t('dashboard.analytics.last14Days')}</div>
                </div>

                <div className="luxury-card" style={{ background: '#fff', padding: '1.5rem', border: '1px solid #f0f0f0' }}>
                    <div style={{ color: '#805ad5', marginBottom: '0.5rem' }}><TrendingUp size={20} /></div>
                    <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.analytics.conversionRate')}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{conversionRate}%</div>
                    <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>{t('dashboard.analytics.visitsVsSubmissions')}</p>
                </div>

                <div className="luxury-card" style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)', padding: '1.5rem', border: 'none', color: '#fff' }}>
                    <div style={{ color: '#FFD700', marginBottom: '0.5rem' }}><Zap size={20} /></div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, textTransform: 'uppercase' }}>{t('dashboard.analytics.insightOfWeek')}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.5rem', lineHeight: 1.4 }}>
                        {parseFloat(conversionRate.toString()) > 10
                            ? t('dashboard.analytics.insightGood')
                            : t('dashboard.analytics.insightImprove')}
                    </div>
                </div>
            </div>

            {/* Chart 1: Evolution */}
            <div className="luxury-card" style={{ background: '#fff', border: 'none', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={20} className="gold-text" /> {t('dashboard.analytics.evolution')}
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.85rem' }}>{t('dashboard.analytics.trafficAndConversions')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700' }} /> {t('dashboard.analytics.submissions')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ddd' }} /> {t('dashboard.analytics.visits')}
                        </div>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#888' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#000', border: 'none', borderRadius: '15px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                                itemStyle={{ fontSize: '0.8rem' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="visits"
                                name={t('dashboard.analytics.visits')}
                                stroke="#ddd"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name={t('dashboard.analytics.submissions')}
                                stroke="#FFD700"
                                strokeWidth={4}
                                dot={{ fill: '#FFD700', strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 8, fill: '#fff', stroke: '#FFD700', strokeWidth: 2 }}
                            />
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
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('dashboard.analytics.participantOrigin')}</h3>
                        <p style={{ color: '#666', fontSize: '0.85rem' }}>{t('dashboard.analytics.geoDistribution')}</p>
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
                                <Bar dataKey="value" name="Participantes" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.geoStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FFD700' : '#E5C100'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#999', border: '2px dashed #eee', borderRadius: '12px' }}>
                        <Globe size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>{t('dashboard.analytics.noGeoData') || 'Sem dados geográficos ainda.'}</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{t('dashboard.analytics.geoDataHelp') || 'Os dados aparecerão quando os participantes preencherem campos de morada.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
