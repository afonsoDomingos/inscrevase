"use client";

import { Award, UserCheck } from 'lucide-react';
import Image from 'next/image';

export interface CertificateConfig {
    enabled: boolean;
    template: string;
    primaryColor: string;
    backgroundColor: string;
    nameColor: string;
    title: string;
    subtitle: string;
    description: string;
    signerName: string;
    signerRole: string;
    requireCheckIn: boolean;
    showLogo: boolean;
}

interface CertificateEditorProps {
    config: CertificateConfig;
    onChange: (config: CertificateConfig) => void;
    mentorName: string; // fallback if signerName is empty
    logo?: string;
}

export default function CertificateEditor({ config, onChange, mentorName, logo }: CertificateEditorProps) {
    // Defaults if config is partial
    const safeConfig: CertificateConfig = {
        enabled: config?.enabled || false,
        template: config?.template || 'classic',
        primaryColor: config?.primaryColor || '#D4AF37',
        backgroundColor: config?.backgroundColor || '#ffffff',
        nameColor: config?.nameColor || '#EAB308',
        title: config?.title || 'CERTIFICADO DE PARTICIPAÇÃO',
        subtitle: config?.subtitle || 'DE CONCLUSÃO',
        description: config?.description || 'Certificamos que {name} participou com sucesso do evento {event_name}, realizado na data {date}.',
        signerName: config?.signerName || mentorName,
        signerRole: config?.signerRole || 'Mentor Responsável',
        requireCheckIn: config?.requireCheckIn || false,
        showLogo: config?.showLogo !== undefined ? config.showLogo : true
    };

    const handleChange = (key: keyof CertificateConfig, value: string | boolean) => {
        onChange({ ...safeConfig, [key]: value });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Left Column: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                {/* Enable Switch */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Habilitar Certificados</h4>
                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#666' }}>Permitir que alunos baixem o certificado.</p>
                    </div>
                    <div
                        onClick={() => handleChange('enabled', !safeConfig.enabled)}
                        style={{
                            width: '50px', height: '30px', background: safeConfig.enabled ? '#10b981' : '#ddd',
                            borderRadius: '30px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                        }}
                    >
                        <div style={{
                            width: '26px', height: '26px', background: '#fff', borderRadius: '50%',
                            position: 'absolute', top: '2px', left: safeConfig.enabled ? '22px' : '2px',
                            transition: 'left 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>

                {/* Check-in Logic */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <UserCheck size={20} color="#666" />
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Controle de Emissão</h4>
                            <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#666' }}>Quem pode receber?</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => handleChange('requireCheckIn', false)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: safeConfig.requireCheckIn ? '1px solid #ddd' : '2px solid #000',
                                background: safeConfig.requireCheckIn ? '#fff' : '#000', color: safeConfig.requireCheckIn ? '#666' : '#fff',
                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                            }}
                        >
                            Todos Pagantes
                        </button>
                        <button
                            onClick={() => handleChange('requireCheckIn', true)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: !safeConfig.requireCheckIn ? '1px solid #ddd' : '2px solid #000',
                                background: !safeConfig.requireCheckIn ? '#fff' : '#000', color: !safeConfig.requireCheckIn ? '#666' : '#fff',
                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                            }}
                        >
                            Apenas com Check-in
                        </button>
                    </div>
                </div>

                {/* Visual Settings */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'grid', gap: '15px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Personalização Visual</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Cor de Destaque</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={safeConfig.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={safeConfig.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Cor do Nome</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={safeConfig.nameColor}
                                    onChange={(e) => handleChange('nameColor', e.target.value)}
                                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={safeConfig.nameColor}
                                    onChange={(e) => handleChange('nameColor', e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Cor do Fundo</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={safeConfig.backgroundColor}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={safeConfig.backgroundColor}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Logotipo</label>
                            <button
                                onClick={() => handleChange('showLogo', !safeConfig.showLogo)}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd',
                                    background: safeConfig.showLogo ? '#f8f9fa' : '#fff', color: safeConfig.showLogo ? '#000' : '#888',
                                    fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {safeConfig.showLogo ? '✅ Logo Ativado' : '❌ Logo Desativado'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Título Principal</label>
                        <input
                            type="text"
                            value={safeConfig.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Texto Descritivo</label>
                        <textarea
                            value={safeConfig.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '60px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Assinado Por (Nome)</label>
                            <input
                                type="text"
                                value={safeConfig.signerName}
                                onChange={(e) => handleChange('signerName', e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Cargo / Função</label>
                            <input
                                type="text"
                                value={safeConfig.signerRole}
                                onChange={(e) => handleChange('signerRole', e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Preview */}
            <div style={{ position: 'sticky', top: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} /> Pré-visualização
                </h3>

                <div
                    style={{
                        aspectRatio: '297/210',
                        background: safeConfig.backgroundColor,
                        borderRadius: '8px',
                        position: 'relative',
                        color: safeConfig.primaryColor,
                        padding: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #eee'
                    }}
                >
                    {/* Background Waves Simulation */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '50%', background: safeConfig.primaryColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)', opacity: 0.9 }}></div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '50%', background: safeConfig.primaryColor, clipPath: 'polygon(100% 100%, 0 100%, 100% 0)', opacity: 0.9 }}></div>

                    {/* Borders */}
                    <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px solid #D4AF37', pointerEvents: 'none', zIndex: 10 }}></div>
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '30px', height: '30px', borderLeft: '4px solid #D4AF37', borderBottom: '4px solid #D4AF37', zIndex: 11 }}></div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderRight: '4px solid #D4AF37', borderTop: '4px solid #D4AF37', zIndex: 11 }}></div>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 20, width: '100%', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: safeConfig.showLogo && logo ? 'space-between' : 'flex-end', alignItems: 'center', padding: '0 40px', marginBottom: '10px' }}>
                            {safeConfig.showLogo && logo && (
                                <div style={{ width: '60px', height: '30px', position: 'relative' }}>
                                    <Image src={logo} alt="Logo" fill style={{ objectFit: 'contain' }} />
                                </div>
                            )}
                            <div style={{ textAlign: safeConfig.showLogo && logo ? 'right' : 'center', flex: 1 }}>
                                <div style={{ fontSize: '24px', fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontWeight: 'bold', color: safeConfig.primaryColor, lineHeight: 1 }}>{safeConfig.title}</div>
                                <div style={{ fontSize: '8px', letterSpacing: '2px', color: '#666' }}>{safeConfig.subtitle}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '10px', fontWeight: 'bold', color: '#D4AF37', marginBottom: '5px' }}>ESTE DIPLOMA É CONFERIDO A</div>

                        <div style={{
                            fontSize: '28px',
                            fontFamily: 'Times New Roman, serif',
                            fontStyle: 'italic',
                            color: safeConfig.nameColor,
                            borderBottom: `1px solid ${safeConfig.primaryColor}`,
                            paddingBottom: '5px',
                            marginBottom: '10px',
                            display: 'inline-block',
                            minWidth: '60%'
                        }}>
                            Nome do Participante
                        </div>

                        <div style={{ fontSize: '9px', color: '#666', marginBottom: '20px', width: '70%', margin: '0 auto 20px auto', lineHeight: 1.4 }}>
                            {safeConfig.description} &quot;Workshop GIS Avançado&quot;. Este documento certifica a atualização profissional na data de {new Date().toLocaleDateString()}.
                        </div>

                        {/* Signatures */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontFamily: 'Times New Roman, serif', fontStyle: 'italic', marginBottom: '2px' }}>{safeConfig.signerName}</div>
                                <div style={{ borderTop: `1px solid #D4AF37`, width: '80px', margin: '0 auto', paddingTop: '2px', fontSize: '6px', color: safeConfig.primaryColor, fontWeight: 'bold' }}>{safeConfig.signerRole}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontFamily: 'Times New Roman, serif', fontStyle: 'italic', marginBottom: '2px' }}>{new Date().toLocaleDateString()}</div>
                                <div style={{ borderTop: `1px solid #D4AF37`, width: '80px', margin: '0 auto', paddingTop: '2px', fontSize: '6px', color: '#666', fontWeight: 'bold' }}>DATA DE EMISSÃO</div>
                            </div>
                        </div>
                    </div>

                    {/* Badge Simulation */}
                    <div style={{ position: 'absolute', right: '50px', top: '90px', width: '40px', height: '40px', background: '#D4AF37', borderRadius: '50%', border: `3px solid ${safeConfig.primaryColor}`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '6px', flexDirection: 'column', zIndex: 12 }}>
                        <b>OFFICIAL</b>
                        <span>★</span>
                    </div>

                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#888' }}>
                    * Esta é apenas uma aproximação visual. O PDF final terá alta resolução.
                </div>
            </div>
        </div>
    );
}
