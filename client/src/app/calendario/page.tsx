"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Loader2,
    ArrowRight,
    SearchX
} from 'lucide-react';
import { formService, FormModel } from '@/lib/formService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslate } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';

export default function EventCalendarPage() {
    const { locale } = useTranslate();
    const [events, setEvents] = useState<FormModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await formService.getExploreEvents();
                setEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Calendar logic
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        const days = [];
        // Pad start
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Month days
        for (let i = 1; i <= daysCount; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [currentDate]);

    const getEventsForDate = useMemo(() => (date: Date) => {
        return events.filter(event => {
            if (!event.eventDate) return false;
            const eventD = new Date(event.eventDate);
            return eventD.getDate() === date.getDate() &&
                eventD.getMonth() === date.getMonth() &&
                eventD.getFullYear() === date.getFullYear();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const selectedEvents = useMemo(() => {
        if (!selectedDate) return [];
        return getEventsForDate(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, events]);

    // Search filter for all events list (optional mobile view) - Removed as unused for now

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '100px 20px 60px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 16px', borderRadius: '50px', color: '#D4AF37', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}
                    >
                        <CalendarIcon size={14} /> EXCLUSIVIDADE & PLANEAMENTO
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-playfair)', letterSpacing: '-1px', marginBottom: '1rem' }}
                    >
                        Calendário de <span className="gold-text">Experiências</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: '#888', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}
                    >
                        Não perca nenhum momento importante. Explore a agenda completa de cursos, workshops e eventos exclusivos da nossa rede.
                    </motion.p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'start' }} className="calendar-grid">
                    {/* Calendar View */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '2.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                    >
                        {/* Month Navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-playfair)', textTransform: 'capitalize' }}>
                                {currentDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={prevMonth} style={{ width: '44px', height: '44px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#FFD700'}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} style={{ padding: '0 1.5rem', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    HOJE
                                </button>
                                <button onClick={nextMonth} style={{ width: '44px', height: '44px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#FFD700'}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                            {/* Weekdays Labels */}
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{day}</div>
                            ))}

                            {loading ? (
                                <div style={{ gridColumn: 'span 7', padding: '100px 0', textAlign: 'center' }}>
                                    <Loader2 className="animate-spin" size={32} color="#D4AF37" />
                                </div>
                            ) : (
                                calendarDays.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} />;

                                    const dayEvents = getEventsForDate(day);
                                    const isSelected = selectedDate && day.getTime() === selectedDate.getTime();
                                    const isToday = day.toDateString() === new Date().toDateString();

                                    return (
                                        <motion.div
                                            key={day.getTime()}
                                            whileHover={{ y: -4, background: 'rgba(255,255,255,0.08)' }}
                                            onClick={() => setSelectedDate(day)}
                                            style={{
                                                aspectRatio: '1',
                                                background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${isSelected ? '#D4AF37' : 'rgba(255,255,255,0.05)'}`,
                                                borderRadius: '20px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: isSelected || isToday ? 900 : 500,
                                                color: isToday ? '#D4AF37' : (isSelected ? '#fff' : 'rgba(255,255,255,0.8)')
                                            }}>
                                                {day.getDate()}
                                            </span>

                                            {dayEvents.length > 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '12px',
                                                    display: 'flex',
                                                    gap: '3px'
                                                }}>
                                                    {dayEvents.slice(0, 3).map((_, i) => (
                                                        <div key={i} style={{ width: '5px', height: '5px', background: '#D4AF37', borderRadius: '50%', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }} />
                                                    ))}
                                                    {dayEvents.length > 3 && <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900 }}>+</div>}
                                                </div>
                                            )}

                                            {isToday && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%' }} />
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* Detail Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '1000px' }}
                    >
                        <div style={{ background: 'var(--gold-gradient)', padding: '1.5rem', borderRadius: '24px', color: '#000' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedDate ? formatDate(selectedDate) : 'Selecione um dia'}</h3>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>{selectedEvents.length} Eventos Programados</p>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '10px' }} className="no-scrollbar">
                            <AnimatePresence mode="wait">
                                {selectedEvents.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}
                                    >
                                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                            <SearchX size={24} style={{ opacity: 0.3 }} />
                                        </div>
                                        <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>Ninguém marcou eventos para este dia ainda.</p>
                                    </motion.div>
                                ) : (
                                    selectedEvents.map((event, idx) => (
                                        <motion.div
                                            key={event._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ x: 5 }}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(212,175,55,0.2)',
                                                borderRadius: '24px',
                                                padding: '1.2rem',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onClick={() => window.open(`/f/${event.slug}`, '_blank')}
                                        >
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {event.coverImage && (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <Image src={event.coverImage} alt={event.title} width={80} height={80} style={{ objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>
                                                        {event.eventType || 'Evento'}
                                                    </div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1.2 }}>{event.title}</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#888' }}>
                                                            <Clock size={12} className="gold-text" />
                                                            {event.eventTime || '09:00'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#888' }}>
                                                            <MapPin size={12} className="gold-text" />
                                                            {event.location?.split(',')[0] || 'Online'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ position: 'absolute', right: '1.2rem', bottom: '1.2rem', color: '#D4AF37' }}>
                                                <ArrowRight size={18} />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* CTA for Mentors */}
                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: '#000', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>É um mentor e quer ver o seu evento aqui?</p>
                            <Link
                                href="/dashboard/mentor"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', borderRadius: '14px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.3s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#FFD700' + '22'}
                            >
                                Criar Evento <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
                .gold-text {
                    background: var(--gold-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @media (max-width: 1024px) {
                    .calendar-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
