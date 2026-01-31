import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useTranslate } from "@/context/LanguageContext";

const testimonials = [
    {
        name: 'Carlos Silva',
        role: 'Coach de Liderança',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        rating: 5,
        text: '"A Inscreva.se transformou completamente a forma como gerencio meus workshops. Consegui triplicar o número de participantes em 3 meses!"'
    },
    {
        name: 'Ana Costa',
        role: 'Mentora de Negócios',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        rating: 5,
        text: '"Plataforma intuitiva e profissional. Os certificados automáticos economizam horas do meu tempo. Recomendo 100%!"'
    },
    {
        name: 'Pedro Martins',
        role: 'Speaker Internacional',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        rating: 5,
        text: '"O melhor investimento que fiz para escalar meus eventos online. Suporte impecável e funcionalidades que realmente fazem a diferença!"'
    }
];

export default function Testimonials() {
    const { t } = useTranslate();
    return (
        <section style={{
            background: '#fff',
            padding: '100px 20px',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900,
                        color: '#000',
                        marginBottom: '1rem',
                        letterSpacing: '-1px'
                    }}>
                        {t('home.testimonials.title')}
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t('home.testimonials.description')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}
                            style={{
                                background: '#fff',
                                padding: '40px',
                                borderRadius: '24px',
                                border: '1px solid #eee',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            {/* Quote icon */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '30px',
                                fontSize: '4rem',
                                color: '#FFD700',
                                opacity: 0.2,
                                fontFamily: 'Georgia, serif'
                            }}>
                                &quot;
                            </div>

                            {/* Rating */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="#FFD700" stroke="#FFD700" />
                                ))}
                            </div>

                            {/* Testimonial text */}
                            <p style={{
                                fontSize: '1rem',
                                lineHeight: '1.7',
                                color: '#333',
                                marginBottom: '30px',
                                fontStyle: 'italic'
                            }}>
                                {testimonial.text}
                            </p>

                            {/* Author */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Image
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    width={50}
                                    height={50}
                                    style={{
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid #FFD700'
                                    }}
                                />
                                <div>
                                    <div style={{ fontWeight: 700, color: '#000', fontSize: '1rem' }}>
                                        {testimonial.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
