import { redirect } from 'next/navigation';

/**
 * Legacy /bio/[slug] route — redirect to the canonical /l/[slug]/bio route.
 * This ensures old shared links continue to work.
 */
export default function BioLegacyRedirect({ params }: { params: { slug: string } }) {
    redirect(`/l/${params.slug}/bio`);
}
