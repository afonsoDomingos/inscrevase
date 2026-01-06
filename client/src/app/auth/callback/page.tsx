"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { authService } from '@/lib/authService';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Save token
            Cookies.set('token', token, { expires: 1 });

            // Fetch profile to determine role and redirect
            authService.getProfile().then(user => {
                if (user.role === 'admin' || user.role === 'SuperAdmin') {
                    router.push('/dashboard/admin');
                } else {
                    router.push('/dashboard/mentor');
                }
            }).catch(err => {
                console.error(err);
                router.push('/entrar?error=auth_failed');
            });
        } else {
            router.push('/entrar?error=no_token');
        }
    }, [searchParams, router]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
            <Loader2 className="animate-spin" size={48} color="#FFD700" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Autenticando com Google...</h2>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
                <Loader2 className="animate-spin" size={48} color="#FFD700" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
