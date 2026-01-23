import { MetadataRoute } from 'next';
import { formService } from '@/lib/formService';
import { blogService } from '@/lib/blogService';

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
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
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
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/mentores`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    // 2. Dynamic Routes - Public Forms (Events)
    let formRoutes: MetadataRoute.Sitemap = [];
    try {
        const publicForms = await formService.getPublicForms();
        formRoutes = publicForms.map((form) => ({
            url: `${BASE_URL}/f/${form.slug}`,
            lastModified: new Date(form.updatedAt),
            changeFrequency: 'daily', // Events can change or sell out
            priority: 0.9,
        }));
    } catch (error) {
        console.error('Error generating sitemap for forms:', error);
    }

    // 3. Dynamic Routes - Blog Posts
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await blogService.getPublishedPosts();
        blogRoutes = posts.map((post) => ({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt || post.createdAt),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error generating sitemap for blog posts:', error);
    }

    return [...staticRoutes, ...formRoutes, ...blogRoutes];
}
