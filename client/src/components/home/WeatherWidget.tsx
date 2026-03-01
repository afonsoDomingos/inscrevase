"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudLightning, Clock, MapPin, Loader2 } from 'lucide-react';

interface WeatherData {
    temp: number;
    city: string;
    condition: string;
    timezone: string;
}

export default function WeatherWidget() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

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

                // 2. Get weather data
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                const weatherData = await weatherRes.json();

                setData({
                    temp: Math.round(weatherData.current_weather.temperature),
                    city: city || 'Sua Região',
                    condition: getWeatherCondition(weatherData.current_weather.weathercode),
                    timezone: timezone
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

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'clear': return <Sun className="text-yellow-400" size={20} />;
            case 'cloudy': return <Cloud className="text-gray-400" size={20} />;
            case 'rain': return <CloudRain className="text-blue-400" size={20} />;
            case 'storm': return <CloudLightning className="text-purple-400" size={20} />;
            default: return <Sun className="text-yellow-400" size={20} />;
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
                <span>Carregando...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, borderColor: 'rgba(255, 215, 0, 0.6)' }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                borderRadius: '100px',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                zIndex: 100,
                cursor: 'default',
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
                    {getWeatherIcon(data.condition)}
                </motion.div>
                <span style={{ fontWeight: 900, fontSize: '0.9rem', background: 'linear-gradient(to bottom, #fff, #ccc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {data.temp}°C
                </span>
            </div>

            <div style={{ width: '1px', height: '25px', background: 'rgba(255,255,255,0.1)' }} />

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={12} className="text-yellow-500" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-inter)', letterSpacing: '1px' }}>
                        {currentTime.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: data.timezone
                        })}
                    </span>
                    <span style={{ fontSize: '0.55rem', opacity: 0.6, fontWeight: 700 }}>LOCAL TIME</span>
                </div>
            </div>
        </motion.div>
    );
}
