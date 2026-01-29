import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SocketProvider } from '@/context/SocketContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';
import { Suspense } from "react";
import MetaPixel from '@/components/MetaPixel';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ThemeProvider } from '@/context/ThemeContext';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import HealthCheck from '@/components/common/HealthCheck';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap'
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ['400', '600', '700', '800'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://inscreva-se.com'),
  title: {
    default: "Inscreva-se | Create, Manage & Scale Your Global Events",
    template: "%s | Inscreva-se"
  },
  description: "The all-in-one platform to create premium event registration forms, manage attendees, and process payments globally. Perfect for mentors, coaches, and luxury event organizers.",
  keywords: [
    "event management", "online registration", "mentorship workshops", "ticket sales",
    "premium events", "luxury event platform", "attendee management", "global events",
    "Inscreva-se", "event forms", "seminar management", "online tickets", "course registration"
  ],
  authors: [{ name: "Inscreva.se" }],
  creator: "Inscreva.se",
  publisher: "Inscreva.se",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: 'https://inscreva-se.com',
    title: "Inscreva-se | The Premium Global Event Management Platform",
    description: "Empowering creators and organizations to deliver world-class event experiences with seamless registration and secure payments.",
    siteName: "Inscreva-se",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Inscreva-se - Premium Event Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscreva-se | Professional Event Management Reimagined",
    description: "Launch your next event with a platform designed for excellence. Global reach, local expertise, premium feel.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://inscreva-se.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo.png',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1452AD" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Favicon - Explicit references to prevent Vercel default */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon-precomposed" href="/logo.png" />

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Inscreva.se",
              "url": "https://inscreva-se.com",
              "logo": "https://inscreva-se.com/logo.png",
              "sameAs": [
                "https://facebook.com/inscrevase",
                "https://instagram.com/inscrevase",
                "https://linkedin.com/company/inscrevase"
              ],
              "description": "The leading professional event management and premium ticket registration platform for creators worldwide."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Inscreva.se",
              "url": "https://inscreva-se.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://inscreva-se.com/mentores?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <LoadingScreen />
        <HealthCheck />
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <SocketProvider>
                <ClientLayoutWrapper>
                  <Suspense fallback={null}>
                    <AnalyticsTracker />
                    <MetaPixel pixelId="1313928660767780" />
                  </Suspense>
                  {children}
                  <WhatsAppFloat />
                </ClientLayoutWrapper>
              </SocketProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}