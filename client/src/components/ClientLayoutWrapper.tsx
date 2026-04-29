"use client";

import { usePathname } from "next/navigation";
import ScrollToTop from '@/components/ScrollToTop';
import AuraConcierge from '@/components/AuraConcierge';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import Brain from '@/components/ai/Brain/Brain';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if we are on a public form page (/f/slug) or hub page (/hub/id)
    const isPublicForm = pathname?.startsWith('/f/');
    const isHub = pathname?.startsWith('/hub/');
    const isBioPage = pathname?.includes('/l/') && pathname?.endsWith('/bio');
    const isAuthPage = pathname?.includes('/entrar') || 
                       pathname?.includes('/cadastro') || 
                       pathname?.includes('/esqueci-senha') || 
                       pathname?.includes('/redefinir-senha') || 
                       pathname?.includes('/confirmar-email');

    return (
        <>
            {children}
            {!isPublicForm && !isBioPage && <ScrollToTop />}
            {!isPublicForm && !isHub && !isBioPage && !isAuthPage && <AuraConcierge />}
            {!isPublicForm && !isHub && !isBioPage && !isAuthPage && <WhatsAppFloat />}
            {!isPublicForm && !isHub && !isBioPage && !isAuthPage && <Brain />}
            <CookieConsent />
        </>
    );
}
