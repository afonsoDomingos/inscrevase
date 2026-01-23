import type { Metadata, ResolvingMetadata } from 'next';
import { formService } from '@/lib/formService';
import PublicFormClient from './PublicFormClient';
import Script from 'next/script';

// This is a Server Component
export default async function Page({ params }: { params: { slug: string } }) {
    const { slug } = params;
    let form = null;
    let eventJsonLd = null;

    try {
        form = await formService.getFormBySlug(slug);

        // Prepare JSON-LD Structured Data
        if (form) {
            eventJsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: form.title,
                description: form.description,
                startDate: form.eventDate ? new Date(`${form.eventDate}T${form.eventTime || '00:00'}`).toISOString() : undefined,
                endDate: form.eventDate ? new Date(`${form.eventDate}T${form.eventTime || '23:59'}`).toISOString() : undefined, // Approximation if no end time
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
                        streetAddress: form.location, // Simplified for now
                        addressCountry: 'MZ' // Defaulting to MZ/PT context or dynamic if available
                    }
                },
                image: [form.coverImage],
                organizer: {
                    '@type': 'Person',
                    name: form.creator.name,
                    url: form.creator.socialLinks?.website
                },
                offers: form.paymentConfig?.enabled ? {
                    '@type': 'Offer',
                    price: form.paymentConfig.price,
                    priceCurrency: form.paymentConfig.currency,
                    url: `https://inscreva-se.com/f/${slug}`,
                    availability: (form.capacity && form.submissionCount && form.capacity > form.submissionCount)
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/SoldOut'
                } : {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'MZN',
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

        const previousImages = (await parent).openGraph?.images || [];

        return {
            title: form.title,
            description: form.description.substring(0, 160), // Truncate for optimal SEO
            openGraph: {
                title: form.title,
                description: form.description,
                url: `https://inscreva-se.com/f/${slug}`,
                images: form.coverImage ? [form.coverImage, ...previousImages] : previousImages,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: form.title,
                description: form.description.substring(0, 200),
                images: form.coverImage ? [form.coverImage] : [],
            },
            alternates: {
                canonical: `https://inscreva-se.com/f/${slug}`,
            }
        };
    } catch (e) {
        return {
            title: 'Evento não encontrado',
            description: 'O evento que você procura não existe ou foi removido.'
        };
    }
}
