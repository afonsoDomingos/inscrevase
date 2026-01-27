import { Metadata } from 'next';
import { blogService } from '@/lib/blogService';
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
    } catch (error) {
        return {
            title: 'Blog | Inscreva-se',
            description: 'Dicas e novidades sobre gestão de eventos em Moçambique.'
        };
    }
}

export default function BlogPostPage({ params }: Props) {
    return <BlogPostContent params={params} />;
}
