"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/mentor?tab=lessons');
    }, [router]);

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #D4AF37', borderRadius: '50%' }}></div>
        </div>
    );
}
