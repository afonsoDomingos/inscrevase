import { MetadataRoute } from 'next';
import { formService } from '@/lib/formService';

// Base URL for the website
const BASE_URL = 'https://inscreva-se.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/entrar`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/cadastro`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/planos`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/funcionalidades`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    // 2. Dynamic Routes (Events)
    let dynamicRoutes: MetadataRoute.Sitemap = [];
    try {
        // Fetch public forms/events for the sitemap
        // Note: You might want to implement a specific method in formService for sitemap
        // that only returns active, public forms to minimize payload.
        // For now, we'll try to use explore events which are public.
        const events = await formService.getExploreEvents();

        dynamicRoutes = events.map((event) => ({
            url: `${BASE_URL}/f/${event.slug}`,
            lastModified: new Date(event.createdAt), // Or updated date if available
            changeFrequency: 'daily',
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to generate sitemap for dynamic routes:', error);
    }

    return [...staticRoutes, ...dynamicRoutes];
}
