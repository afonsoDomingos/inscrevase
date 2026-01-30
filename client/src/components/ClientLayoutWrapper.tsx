"use client";

import { usePathname } from "next/navigation";
import ScrollToTop from '@/components/ScrollToTop';
import AuraConcierge from '@/components/AuraConcierge';
import CookieConsent from '@/components/CookieConsent';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if we are on a public form page (/f/slug) or hub page (/hub/id)
    const isPublicForm = pathname?.startsWith('/f/');
    const isHub = pathname?.startsWith('/hub/');

    return (
        <>
            {children}
            {!isPublicForm && !isHub && <ScrollToTop />}
            {!isPublicForm && !isHub && <AuraConcierge />}
            <CookieConsent />
        </>
    );
}
