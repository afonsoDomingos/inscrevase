import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/_next/static/'],
                disallow: ['/dashboard/', '/admin/', '/api/', '/private/'],
            },
            {
                userAgent: 'Mediapartners-Google',
                allow: '/',
            }
        ],
        sitemap: 'https://inscreva-se.com/sitemap.xml',
    };
}
