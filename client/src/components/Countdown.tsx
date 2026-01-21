"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSpotlight } from '@/hooks/useSpotlight';
import { useTranslate } from '@/context/LanguageContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const { t } = useTranslate();
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
    { label: t('countdown.days'), value: timeLeft.days },
    { label: t('countdown.hours'), value: timeLeft.hours },
    { label: t('countdown.minutes'), value: timeLeft.minutes },
    { label: t('countdown.seconds'), value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '3rem auto',
        gap: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}
      className="gold-shimmer-sweep countdown-container"
      onMouseMove={handleMouseMove}
    >
      <div className="spotlight" />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '12px'
        }} className="badge-wrapper">
          <span style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '1px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
            {t('countdown.badge')}
          </span>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.5px' }} className="subtitle-text">
          {t('countdown.description')}
        </p>
      </div>

      <div className="timer-items-wrapper" style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        width: '100%'
      }}>
        {timerItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="timer-box" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '12px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }}>
                {String(item.value).padStart(2, '0')}
              </div>
              <span className="timer-label" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.label}
              </span>
            </div>
            {idx < timerItems.length - 1 && (
              <div className="timer-separator" style={{
                color: '#3b82f6',
                fontWeight: 700,
                fontSize: '1.5rem',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>:</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .countdown-container {
            padding: 2rem 1rem !important;
            gap: 1.5rem !important;
            margin: 1.5rem auto !important;
          }
          .timer-items-wrapper {
            gap: 0.5rem !important;
          }
          .timer-box {
            width: 60px !important;
            height: 60px !important;
            font-size: 1.5rem !important;
            border-radius: 12px !important;
          }
          .timer-label {
            font-size: 0.6rem !important;
          }
          .timer-separator {
            font-size: 1rem !important;
            height: 60px !important;
            margin: 0 -2px !important;
          }
          .subtitle-text {
            font-size: 0.85rem !important;
            padding: 0 10px;
          }
        }
      `}</style>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'transparent',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50px',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'border-color 0.3s',
          position: 'relative',
          zIndex: 2,
          margin: '0 auto'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#fff'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
      >
        <Bell size={18} />
        {t('countdown.notify')}
      </motion.button>
    </motion.div>
  );
}
