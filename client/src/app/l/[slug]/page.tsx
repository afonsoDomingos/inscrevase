import { redirect } from 'next/navigation';

export default function SmartLinkRedirect({ params }: { params: { slug: string } }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const REDIRECT_URL = `${API_URL}/smartlinks/redirect/${params.slug}`;

    // We redirect to the explicit backend API handler to avoid loops and ensure tracking logic (Pixel, Analytics) 
    // and the premium interstitial page are executed on the server side.
    redirect(REDIRECT_URL);

    return null;
}
