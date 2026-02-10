import { MetadataRoute } from 'next';
import { formService } from '@/lib/formService';
import { blogService } from '@/lib/blogService';
import { userService } from '@/lib/userService';

// Base URL for the website
const BASE_URL = 'https://inscreva-se.com';

const safelyGetDate = (dateString?: string | Date) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes - Main pages that could appear as sitelinks
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/experts`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/planos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/updates`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/funcionalidades`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/feedback`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/sobre-nos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/suporte`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/privacidade`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/termos`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        // Team Members (hardcoded in app/equipe/[id]/page.tsx)
        {
            url: `${BASE_URL}/equipe/afonso-domingos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/equipe/culpa-francisco-xavier`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // 2. Dynamic Routes - Experts (Mentors)
    let expertRoutes: MetadataRoute.Sitemap = [];
    try {
        const experts = await userService.getPublicMentors();
        if (Array.isArray(experts)) {
            expertRoutes = experts.map((expert) => {
                const id = expert.id || expert._id;
                return {
                    url: `${BASE_URL}/experts/${id}`,
                    lastModified: safelyGetDate(expert.createdAt),
                    changeFrequency: 'weekly',
                    priority: 0.85,
                };
            });
        }
    } catch (error) {
        console.error('Error generating sitemap for experts:', error);
    }

    // 2. Dynamic Routes - Public Forms (Events)
    let formRoutes: MetadataRoute.Sitemap = [];
    try {
        const publicForms = await formService.getPublicForms();
        if (Array.isArray(publicForms)) {
            formRoutes = publicForms.map((form) => ({
                url: `${BASE_URL}/f/${form.slug}`,
                lastModified: safelyGetDate(form.updatedAt),
                changeFrequency: 'daily', // Events can change or sell out
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error('Error generating sitemap for forms:', error);
    }

    // 3. Dynamic Routes - Blog Posts
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await blogService.getPublishedPosts();
        if (Array.isArray(posts)) {
            blogRoutes = posts.map((post) => ({
                url: `${BASE_URL}/blog/${post.slug}`,
                lastModified: safelyGetDate(post.updatedAt || post.createdAt),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Error generating sitemap for blog posts:', error);
    }

    return [...staticRoutes, ...expertRoutes, ...formRoutes, ...blogRoutes];
}
