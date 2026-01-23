import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, TrendingUp, Users, Lightbulb } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Blog - Dicas para Organizar Eventos de Sucesso',
    description: 'Aprenda como organizar eventos online, aumentar vendas de ingressos e escalar sua mentoria com nossas dicas exclusivas.',
    openGraph: {
        title: 'Blog | Inscreva-se',
        description: 'Guias, dicas e estratégias para organizar eventos de sucesso',
    }
};

const blogPosts = [
    {
        slug: 'como-organizar-eventos-online',
        title: 'Como Organizar Eventos Online que Convertem',
        excerpt: 'Descubra as 7 estratégias essenciais para criar eventos online que realmente engajam e convertem participantes.',
        category: 'Guias',
        icon: Calendar,
        readTime: '8 min',
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop'
    },
    {
        slug: '7-dicas-vender-mais-ingressos',
        title: '7 Dicas Comprovadas para Vender Mais Ingressos',
        excerpt: 'Aumente suas vendas com estas técnicas de marketing e conversão testadas por milhares de mentores.',
        category: 'Marketing',
        icon: TrendingUp,
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop'
    },
    {
        slug: 'mentoria-online-guia-completo',
        title: 'Mentoria Online: Guia Completo para Iniciantes',
        excerpt: 'Tudo que você precisa saber para começar sua jornada como mentor online e escalar seu negócio.',
        category: 'Mentoria',
        icon: Users,
        readTime: '10 min',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop'
    },
    {
        slug: 'estrategias-engajamento-participantes',
        title: 'Estratégias de Engajamento Durante Eventos',
        excerpt: 'Mantenha seus participantes engajados do início ao fim com estas táticas práticas e efetivas.',
        category: 'Engajamento',
        icon: Lightbulb,
        readTime: '7 min',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
    }
];

export default function BlogPage() {
    return (
        <main style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
                padding: '120px 20px 80px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 900,
                        color: '#fff',
                        marginBottom: '1.5rem',
                        letterSpacing: '-2px'
                    }}>
                        Blog Inscreva.se
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#aaa',
                        lineHeight: '1.8'
                    }}>
                        Dicas, estratégias e guias para você organizar eventos de sucesso e escalar sua mentoria
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '40px'
                }}>
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block',
                                background: '#fff',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: '1px solid #eee',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            className="blog-post-card"
                        >
                            {/* Image */}
                            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    background: '#FFD700',
                                    color: '#000',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {post.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '30px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '15px',
                                    color: '#666',
                                    fontSize: '0.85rem'
                                }}>
                                    <post.icon size={16} />
                                    <span>{post.readTime} de leitura</span>
                                </div>

                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    color: '#000',
                                    marginBottom: '12px',
                                    lineHeight: '1.3'
                                }}>
                                    {post.title}
                                </h2>

                                <p style={{
                                    fontSize: '1rem',
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    {post.excerpt}
                                </p>

                                <div style={{
                                    marginTop: '20px',
                                    color: '#FFD700',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    Ler artigo →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .blog-post-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
        }
      `}</style>
        </main>
    );
}
