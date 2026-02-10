import type { Metadata, ResolvingMetadata } from 'next';
import { userService } from '@/lib/userService';
import { notFound } from 'next/navigation';
import { ExpertProfileClient } from './ExpertProfileClient';

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// This is a Server Component
export default async function Page({ params }: Props) {
    const { id } = params;

    try {
        const mentor = await userService.getPublicMentorById(id);

        if (!mentor) {
            notFound();
        }

        return <ExpertProfileClient />;
    } catch (error) {
        console.error("Error fetching mentor for page:", error);
        notFound();
    }
}

// Generate Dynamic Metadata for Search Engines
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id;

    try {
        const mentor = await userService.getPublicMentorById(id);

        if (!mentor) return {
            title: 'Expert | Inscreva-se',
            description: 'Conheça nossos especialistas.'
        };

        const previousImages = (await parent).openGraph?.images || [];
        const profilePhoto = mentor.profilePhoto || 'https://inscreva-se.com/og-image.png';

        return {
            title: `${mentor.name} | Expert Inscreva-se`,
            description: mentor.bio?.substring(0, 160) || `Acompanhe o perfil de ${mentor.name} no Inscreva-se.`,
            openGraph: {
                title: `${mentor.name} | Expert Inscreva-se`,
                description: mentor.bio,
                url: `https://inscreva-se.com/experts/${id}`,
                images: [profilePhoto, ...previousImages],
                type: 'profile',
                firstName: mentor.name.split(' ')[0],
                lastName: mentor.name.split(' ').slice(1).join(' '),
            },
            twitter: {
                card: 'summary_large_image',
                title: `${mentor.name} | Expert`,
                description: mentor.bio?.substring(0, 200),
                images: [profilePhoto],
            },
            alternates: {
                canonical: `https://inscreva-se.com/experts/${id}`,
            }
        };
    } catch {
        return {
            title: 'Expert | Inscreva-se',
            description: 'Conheça nossos especialistas.'
        };
    }
}
