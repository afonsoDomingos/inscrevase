"use client";

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function GoogleAdsense() {
    const pathname = usePathname();
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    if (!clientId) return null;

    // Do not load AdSense on private/auth pages
    const isPrivate = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/entrar') || 
                      pathname.startsWith('/cadastro') || 
                      pathname.startsWith('/admin') ||
                      pathname.startsWith('/settings');

    if (isPrivate) return null;

    return (
        <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        />
    );
}
