/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.svgrepo.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.licdn.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'inscreva-se.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'inscrevase.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'inscrevase.onrender.com',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.BACKEND_API_URL || 'https://inscrevase.onrender.com/api'}/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${(process.env.BACKEND_API_URL || 'https://inscrevase.onrender.com/api').replace('/api', '')}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
// Cache cleared at: 2026-01-08T23:20:00Z
