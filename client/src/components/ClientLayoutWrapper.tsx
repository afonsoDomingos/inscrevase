"use client";

import { usePathname } from "next/navigation";
import ScrollToTop from '@/components/ScrollToTop';
import AuraConcierge from '@/components/AuraConcierge';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if we are on a public form page (/f/slug)
    const isPublicForm = pathname?.startsWith('/f/');

    return (
        <>
            {children}
            {!isPublicForm && <ScrollToTop />}
            {!isPublicForm && <AuraConcierge />}
        </>
    );
}
