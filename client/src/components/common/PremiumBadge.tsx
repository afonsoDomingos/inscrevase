
import { BadgeCheck, ShieldAlert, Crown, Zap, Briefcase, Star, Gem } from 'lucide-react';
import { useTranslate } from '@/context/LanguageContext';

interface PremiumBadgeProps {
    type: 'verified' | 'admin' | 'superadmin' | 'mentor' | 'participant' | 'free' | 'pro' | 'enterprise' | 'pending';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function PremiumBadge({ type, size = 'md', showLabel = true }: PremiumBadgeProps) {
    const { t } = useTranslate();

    const configs = {
        verified: {
            icon: BadgeCheck,
            label: t('common.badges.verified'),
            bg: '#0066FF', // Vibrant blue from images
            color: '#fff',
            border: '2px solid #fff',
            shadow: '0 2px 8px rgba(0, 102, 255, 0.4)'
        },
        pending: {
            icon: Star,
            label: t('common.badges.pending'),
            bg: '#FFF4E5',
            color: '#FF8C00',
            border: '1px solid #FFE4B5',
            shadow: 'none'
        },
        admin: {
            icon: ShieldAlert,
            label: t('common.badges.admin'),
            bg: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
            color: '#FBD38D',
            border: '1px solid rgba(251, 211, 141, 0.3)',
            shadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        superadmin: {
            icon: Crown,
            label: t('common.badges.superadmin'),
            bg: 'linear-gradient(135deg, #000 0%, #222 100%)',
            color: '#FFD700',
            border: '1px solid #FFD700',
            shadow: '0 4px 6px rgba(0,0,0,0.4)'
        },
        mentor: {
            icon: Briefcase,
            label: t('common.badges.mentor'),
            bg: '#F7FAFC',
            color: '#4A5568',
            border: '1px solid #E2E8F0',
            shadow: 'none'
        },
        participant: {
            icon: Star,
            label: t('common.badges.participant'),
            bg: '#F0FFF4',
            color: '#38A169',
            border: '1px solid #C6F6D5',
            shadow: 'none'
        },
        free: {
            icon: Star,
            label: t('common.badges.free'),
            bg: '#EDF2F7',
            color: '#718096',
            border: '1px solid #CBD5E0',
            shadow: 'none'
        },
        pro: {
            icon: Zap,
            label: t('common.badges.pro'),
            bg: 'linear-gradient(135deg, #FFD700 0%, #F6AD55 100%)',
            color: '#fff',
            border: 'none',
            shadow: '0 2px 4px rgba(236, 201, 75, 0.4)'
        },
        enterprise: {
            icon: Gem,
            label: t('common.badges.enterprise'),
            bg: 'linear-gradient(135deg, #805AD5 0%, #553C9A 100%)',
            color: '#fff',
            border: 'none',
            shadow: '0 2px 8px rgba(128, 90, 213, 0.4)'
        }
    };

    const config = configs[type] || configs.free;
    const Icon = config.icon;

    // Size mappings
    const iconSizes = { sm: 12, md: 14, lg: 18 };
    const fontSizes = { sm: '0.65rem', md: '0.75rem', lg: '0.9rem' };
    const paddings = { sm: '2px 6px', md: '4px 10px', lg: '6px 14px' };
    const gap = { sm: '3px', md: '5px', lg: '6px' };

    // If verified type and no label, just show the circular badge
    if (type === 'verified' && !showLabel) {
        return (
            <div title={t('common.badges.verified')} style={{ display: 'inline-flex', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                <BadgeCheck size={iconSizes[size] + 6} fill="#0066FF" color="#fff" strokeWidth={2.5} />
            </div>
        );
    }

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: gap[size],
            background: config.bg,
            color: config.color,
            padding: paddings[size],
            borderRadius: '20px',
            fontSize: fontSizes[size],
            fontWeight: 700,
            border: config.border,
            boxShadow: config.shadow,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: 1,
            userSelect: 'none'
        }}>
            <Icon size={iconSizes[size]} fill={['verified', 'pro', 'enterprise'].includes(type) ? 'currentColor' : 'none'} />
            {showLabel && <span>{config.label}</span>}
        </div>
    );
}
