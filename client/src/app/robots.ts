import { MetadataRoute } from 'next';

const BASE_URL = 'https://inscreva-se.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/hub/', '/admin/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
