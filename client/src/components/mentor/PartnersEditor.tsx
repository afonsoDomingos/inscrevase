"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, User, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, UserData } from '@/lib/authService';
import Image from 'next/image';
import { toast } from 'sonner';

interface Partner {
    _id: string;
    name: string;
    businessName?: string;
    profilePhoto?: string;
}

interface PartnersEditorProps {
    partners: (string | Partner)[];
    onChange: (partners: string[]) => void;
}

export default function PartnersEditor({ partners, onChange }: PartnersEditorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [searching, setSearching] = useState(false);
    const [resolvedPartners, setResolvedPartners] = useState<Partner[]>([]);

    // Resolve partner IDs to objects if they are strings
    // In many cases, the component receives the objects from the API
    useEffect(() => {
        const resolve = async () => {
            const currentPartners = partners.filter((p): p is Partner => typeof p !== 'string');
            setResolvedPartners(currentPartners);
        };
        resolve();
    }, [partners]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const results = await authService.searchMentors(query);
            // Filter out already added partners
            const partnerIds = partners.map(p => typeof p === 'string' ? p : p._id);
            const filteredResults = results.filter(r => !partnerIds.includes(r.id || r._id || ''));
            setSearchResults(filteredResults);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const addPartner = (user: UserData) => {
        const userId = user.id || user._id;
        if (!userId) return;

        const partnerIds = partners.map(p => typeof p === 'string' ? p : p._id);
        if (partnerIds.includes(userId)) {
            toast.error('Este mentor já é um parceiro');
            return;
        }

        onChange([...partnerIds, userId]);

        // Optimistic update for UI
        setResolvedPartners([...resolvedPartners, {
            _id: userId,
            name: user.name,
            businessName: user.businessName,
            profilePhoto: user.profilePhoto
        }]);

        setSearchQuery('');
        setSearchResults([]);
    };

    const removePartner = (partnerId: string) => {
        const partnerIds = partners.map(p => typeof p === 'string' ? p : p._id);
        onChange(partnerIds.filter(id => id !== partnerId));
        setResolvedPartners(resolvedPartners.filter(p => p._id !== partnerId));
    };

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Parceiros & Co-organizadores</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Convide outros mentores para colaborar na gestão deste evento.</p>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0.8rem 1.2rem',
                    background: '#f5f5f5',
                    borderRadius: '12px',
                    border: '1px solid #ddd'
                }}>
                    <Search size={20} color="#666" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar mentor por nome ou e-mail..."
                        style={{
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.95rem'
                        }}
                    />
                    {searching && <Loader2 size={18} className="animate-spin" color="#FFD700" />}
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                right: 0,
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '1px solid #eee',
                                zIndex: 100,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}
                        >
                            {searchResults.map(user => (
                                <button
                                    key={user.id || user._id}
                                    onClick={() => addPartner(user)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderBottom: '1px solid #f5f5f5',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: '#eee',
                                        position: 'relative',
                                        flexShrink: 0
                                    }}>
                                        {user.profilePhoto ? (
                                            <Image src={user.profilePhoto} alt={user.name} fill style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.businessName || user.email}</div>
                                    </div>
                                    <Plus size={18} color="#FFD700" />
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Partners List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>Parceiros Selecionados ({resolvedPartners.length})</h4>

                {resolvedPartners.length === 0 ? (
                    <div style={{
                        padding: '2rem',
                        background: '#f9f9f9',
                        borderRadius: '15px',
                        border: '2px dashed #ddd',
                        textAlign: 'center'
                    }}>
                        <Info size={32} color="#ccc" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>Nenhum parceiro convidado ainda.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {resolvedPartners.map(partner => (
                            <motion.div
                                key={partner._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    padding: '1rem',
                                    background: '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid #eee'
                                }}
                            >
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: '#eee',
                                    position: 'relative'
                                }}>
                                    {partner.profilePhoto ? (
                                        <Image src={partner.profilePhoto} alt={partner.name} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#111' }}>{partner.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{partner.businessName || 'Mentor'}</div>
                                </div>
                                <button
                                    onClick={() => removePartner(partner._id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '5px'
                                    }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
