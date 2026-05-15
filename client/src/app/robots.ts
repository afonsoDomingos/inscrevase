import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Mediapartners-Google',
                allow: '/',
            },
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/_next/static/',
                    '/f/',
                    '/experts/',
                    '/blog/',
                    '/vagas/',
                    '/planos',
                    '/sobre-nos',
                    '/suporte',
                    '/updates',
                    '/feedback',
                    '/funcionalidades',
                    '/termos',
                    '/privacidade',
                    '/equipe/'
                ],
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/api/',
                    '/private/',
                    '/hub/',
                    '/entrar',
                    '/cadastro',
                    '/recuperar-senha',
                    '/*?*', // Disallow search/query params if not needed for indexing
                ],
            },
            {
                userAgent: 'GPTBot',
                disallow: ['/'],
            }
        ],
        sitemap: 'https://inscreva-se.com/sitemap.xml',
    };
}
