"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSpotlight } from '@/hooks/useSpotlight';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const { handleMouseMove } = useSpotlight();

  useEffect(() => {
    setIsMounted(true);
    
    // Stable calculation function inside effect to avoid dependency issues
    const updateTime = () => {
      const target = new Date('2026-02-14T00:00:00');
      const now = new Date();
      const difference = +target - +now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);



  if (!isMounted) return null;

  const timerItems = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        margin: '2rem auto',
        flexWrap: 'wrap',
        gap: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="gold-shimmer-sweep"
      onMouseMove={handleMouseMove}
    >
      <div className="spotlight" />
      <div style={{ textAlign: 'left', position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '8px' 
        }}>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: '#3b82f6', 
            padding: '4px 12px', 
            borderRadius: '50px', 
            fontSize: '0.75rem', 
            fontWeight: 800,
            letterSpacing: '1px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            LANÇAMENTO
          </span>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 500 }}>
          A revolução chega em breve
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        {timerItems.map((item, idx) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '10px'
              }}>
                {String(item.value).padStart(2, '0')}
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', fontWeight: 600 }}>{item.label}</span>
            </div>
            {idx < timerItems.length - 1 && (
              <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.2rem', marginTop: '-20px' }}>:</div>
            )}
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'transparent',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'border-color 0.3s',
          position: 'relative',
          zIndex: 2
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#fff'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
      >
        <Bell size={18} />
        Notificar-me
      </motion.button>
    </motion.div>
  );
}
