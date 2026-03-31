"use client";

import { useState, useEffect } from 'react';
import MetaPixel from './MetaPixel';

export default function GlobalMetaPixel() {
    const [pixelId, setPixelId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPixel = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/meta-pixel`);
                const data = await response.json();
                if (data.pixelId) {
                    setPixelId(data.pixelId);
                } else {
                    setPixelId("1624084229040413"); // Fallback
                }
            } catch (error) {
                console.error('Error fetching global pixel:', error);
                setPixelId("1624084229040413"); // Fallback on error
            }
        };

        fetchPixel();
    }, []);

    if (!pixelId) return null;

    return <MetaPixel pixelId={pixelId} />;
}
