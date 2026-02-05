import type { Metadata, ResolvingMetadata } from 'next';
import { formService } from '@/lib/formService';
import PublicFormClient from './PublicFormClient';

// Force dynamic rendering to prevent stale data (e.g. seeing deleted events)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This is a Server Component
export default async function Page({ params }: { params: { slug: string } }) {
    const { slug } = params;
    let form = null;
    let eventJsonLd = null;

    const safeToISO = (dateStr: string | null | undefined, timeStr?: string | null | undefined) => {
        if (!dateStr) return undefined;
        try {
            const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
            if (isNaN(date.getTime())) return undefined;
            return date.toISOString();
        } catch {
            return undefined;
        }
    };

    try {
        form = await formService.getFormBySlug(slug);

        // Prepare JSON-LD Structured Data
        if (form && form.eventDate) {
            eventJsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: form.title,
                description: form.description,
                startDate: safeToISO(form.eventDate, form.eventTime),
                endDate: safeToISO(form.eventDate, form.eventTime || '23:59'), // Approximation if no end time
                eventStatus: 'https://schema.org/EventScheduled',
                eventAttendanceMode: form.eventType === 'modeOnline' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
                location: form.eventType === 'modeOnline' ? {
                    '@type': 'VirtualLocation',
                    url: form.onlineLink || `https://inscreva-se.com/f/${slug}`
                } : {
                    '@type': 'Place',
                    name: form.location,
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: form.location,
                        // Removed hardcoded MZ country to be global
                    }
                },
                image: [form.coverImage || 'https://inscreva-se.com/og-image.png'],
                organizer: {
                    '@type': 'Person',
                    name: form.creator.name,
                    url: form.creator.socialLinks?.website
                },
                offers: form.paymentConfig?.enabled ? {
                    '@type': 'Offer',
                    price: form.paymentConfig.price,
                    priceCurrency: form.paymentConfig.currency || 'USD',
                    url: `https://inscreva-se.com/f/${slug}`,
                    availability: (form.capacity && form.submissionCount && form.capacity > form.submissionCount)
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/SoldOut'
                } : {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: form.paymentConfig?.currency || 'USD',
                    url: `https://inscreva-se.com/f/${slug}`,
                    availability: 'https://schema.org/InStock'
                }
            };
        }

    } catch (error) {
        console.error("Error fetching form for metadata:", error);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
            />
            <PublicFormClient params={params} initialForm={form} />
        </>
    );
}

// Generate Dynamic Metadata
export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;

    try {
        const form = await formService.getFormBySlug(slug);

        if (!form) throw new Error("Form not found");

        const previousImages = (await parent).openGraph?.images || [];
        const coverImage = form.coverImage || 'https://inscreva-se.com/og-image.png';

        return {
            title: `${form.title} | Inscreva-se`,
            description: form.description?.substring(0, 160) || "Join this amazing event on Inscreva-se.",
            openGraph: {
                title: form.title,
                description: form.description,
                url: `https://inscreva-se.com/f/${slug}`,
                images: [coverImage, ...previousImages],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: form.title,
                description: form.description?.substring(0, 200),
                images: [coverImage],
            },
            alternates: {
                canonical: `https://inscreva-se.com/f/${slug}`,
            }
        };
    } catch {
        return {
            title: 'Event Not Found | Inscreva-se',
            description: 'The event you are looking for does not exist or has been removed.'
        };
    }
}
