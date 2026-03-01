"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudLightning, Clock, MapPin, Loader2, Wind, Droplets, Umbrella, X, Thermometer, Calendar } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

interface WeatherData {
    temp: number;
    feelsLike: number;
    city: string;
    condition: string;
    timezone: string;
    windSpeed: number;
    humidity: number;
    precipitation: number;
    precipitationProbability: number;
}

export default function WeatherWidget() {
    const { t, locale } = useTranslate();
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showFullDetails, setShowFullDetails] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const fetchWeather = async () => {
            try {
                // 1. Get location data
                const locRes = await fetch('https://ipapi.co/json/');
                const locData = await locRes.json();

                const { latitude, longitude, city, timezone } = locData;

                // 2. Get weather data with more details
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=auto`);
                const weatherData = await weatherRes.json();

                // Get current hour's precipitation probability
                const currentHour = new Date().getHours();
                const prob = weatherData.hourly?.precipitation_probability?.[currentHour] || 0;

                setData({
                    temp: Math.round(weatherData.current.temperature_2m),
                    feelsLike: Math.round(weatherData.current.apparent_temperature),
                    city: city || 'Sua Região',
                    condition: getWeatherCondition(weatherData.current.weather_code),
                    timezone: timezone,
                    windSpeed: weatherData.current.wind_speed_10m,
                    humidity: weatherData.current.relative_humidity_2m,
                    precipitation: weatherData.current.precipitation,
                    precipitationProbability: prob
                });
            } catch (error) {
                console.error('Error fetching weather:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        return () => clearInterval(timer);
    }, []);

    const getWeatherCondition = (code: number) => {
        if (code === 0) return 'clear';
        if (code >= 1 && code <= 3) return 'cloudy';
        if (code >= 51 && code <= 67) return 'rain';
        if (code >= 71 && code <= 77) return 'snow';
        if (code >= 95) return 'storm';
        return 'cloudy';
    };

    const getWeatherIcon = (condition: string, size = 20) => {
        switch (condition) {
            case 'clear': return <Sun className="text-yellow-400" size={size} />;
            case 'cloudy': return <Cloud className="text-gray-400" size={size} />;
            case 'rain': return <CloudRain className="text-blue-400" size={size} />;
            case 'storm': return <CloudLightning className="text-purple-400" size={size} />;
            default: return <Sun className="text-yellow-400" size={size} />;
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '0.8rem'
            }}>
                <Loader2 size={14} className="animate-spin" />
                <span>{t('home.widgets.weather.loading')}</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 215, 0, 0.6)' }}
                onClick={() => setShowFullDetails(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    userSelect: 'none'
                }}
            >
                {/* City & Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MapPin size={12} className="text-yellow-500" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#FFD700' }}>{data.city}</span>
                        <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{data.timezone.split('/')[0]}</span>
                    </div>
                </div>

                <div style={{ width: '1px', height: '25px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Weather */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                        {getWeatherIcon(data.condition, 18)}
                    </motion.div>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#fff' }}>
                        {data.temp}°C
                    </span>
                </div>

                <div style={{ width: '1px', height: '25px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Time & Click Hint */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <Clock size={12} className="text-yellow-500" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                            {currentTime.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: data.timezone
                            })}
                        </span>
                    </div>

                    {/* Pulsing Hint Dot */}
                    <div style={{ marginLeft: '4px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                position: 'absolute',
                                width: '6px',
                                height: '6px',
                                background: '#FFD700',
                                borderRadius: '50%',
                            }}
                        />
                        <div style={{ width: '6px', height: '6px', background: '#FFD700', borderRadius: '50%', zIndex: 1 }} />
                    </div>
                </div>
            </motion.div>

            {/* Detailed Modal/Overlay */}
            <AnimatePresence>
                {showFullDetails && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFullDetails(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                width: '100%',
                                maxWidth: '380px',
                                background: 'linear-gradient(135deg, rgba(30,30,30,0.95), rgba(0,0,0,0.98))',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,215,0,0.3)',
                                padding: '2rem',
                                color: '#fff',
                                position: 'relative',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.1)'
                            }}
                        >
                            <button
                                onClick={() => setShowFullDetails(false)}
                                style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', color: '#fff' }}>
                                    <MapPin size={18} className="text-yellow-500" />
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>{data.city}</h2>
                                </div>
                                <p style={{ opacity: 0.8, fontSize: '0.95rem', fontWeight: 600, color: '#FFD700', marginBottom: '4px', textTransform: 'capitalize' }}>
                                    {currentTime.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-US', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>{data.timezone}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{data.temp}°</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, marginTop: '8px' }}>
                                        <Thermometer size={14} />
                                        <span>{t('home.widgets.weather.feelsLike')}: {data.feelsLike}°C</span>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    {getWeatherIcon(data.condition, 64)}
                                </motion.div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Wind size={20} className="text-yellow-500" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>{t('home.widgets.weather.wind')}</div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{data.windSpeed} km/h</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Droplets size={20} className="text-blue-400" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>{t('home.widgets.weather.humidity')}</div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{data.humidity}%</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                                    <Umbrella size={20} className="text-purple-400" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>{t('home.widgets.weather.precipitation')}</div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{data.precipitation} mm ({data.precipitationProbability}%)</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(212,175,55,0.1)', color: '#FFD700', padding: '4px 12px', borderRadius: '50px' }}>
                                        {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: data.timezone })}
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, background: '#FFD700', color: '#000' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.location.href = '/calendario'}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    borderRadius: '16px',
                                    color: '#FFD700',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Calendar size={20} />
                                {t('home.widgets.weather.viewCalendar')}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
