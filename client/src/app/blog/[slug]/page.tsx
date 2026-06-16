import { Metadata } from 'next';
import { blogService } from '@/lib/blogService';
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent';

type Props = {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    try {
        // Fetch data
        const post = await blogService.getPostBySlug(params.slug);

        if (!post) {
            return {
                title: 'Artigo não encontrado',
                description: 'O artigo que você procura não existe.'
            };
        }

        const images = post.coverImage ? [post.coverImage] : ['https://inscreva-se.com/og-image.jpg'];

        return {
            title: post.title,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                images: images,
                type: 'article',
                publishedTime: post.publishedAt || post.createdAt,
                authors: [post.author?.name || 'Inscreva-se Team'],
                tags: post.tags,
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: images,
            },
        };
    } catch {
        return {
            title: 'Blog | Inscreva-se',
            description: 'Dicas e novidades sobre gestão de eventos em Moçambique.'
        };
    }
}

export default async function BlogPostPage({ params }: Props) {
    const post = await blogService.getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    // JSON-LD Structured Data for AdSense/Google
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage || 'https://inscreva-se.com/og-image.jpg',
        author: {
            '@type': 'Organization',
            name: post.author?.name || 'Equipe Inscreva.se',
            url: 'https://inscreva-se.com/sobre-nos',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Inscreva-se',
            logo: {
                '@type': 'ImageObject',
                url: 'https://inscreva-se.com/icon.png',
            },
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://inscreva-se.com/blog/${params.slug}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogPostContent initialPost={post} params={params} />
        </>
    );
}
