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
    default: "Inscreva-se | A Melhor Plataforma de Eventos de Luxo e Gestão de Ingressos",
    template: "%s | Inscreva-se"
  },
  description: "Crie, gerencie e escale seus eventos com a plataforma líder em Moçambique. Gestão premium de ingressos para mentores, palestrantes e organizações de prestígio.",
  keywords: [
    "eventos", "mentoria", "workshop", "tickets", "ingressos", "luxo", "premium", "gestão de eventos",
    "Moçambique", "venda de ingressos online", "organização de palestras", "plataforma de eventos",
    "Inscreva-se", "Inscrevase", "Maputo eventos", "bilhetes online"
  ],
  authors: [{ name: "Inscreva.se" }],
  creator: "Inscreva.se",
  publisher: "Inscreva.se",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: 'https://inscreva-se.com',
    title: "Inscreva-se | Plataforma Premium de Gestão de Eventos",
    description: "A solução completa para organizar eventos de luxo e gerir inscrições com elegância e segurança.",
    siteName: "Inscreva-se",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 1200,
        alt: "Inscreva-se Logo Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscreva-se | Gestão de Eventos de Luxo",
    description: "Organize seus workshops e palestras com a plataforma mais sofisticada do mercado moçambicano.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://inscreva-se.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
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
        <meta name="theme-color" content="#FFD700" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
              "description": "A plataforma líder em gestão de eventos e venda de ingressos premium em Moçambique."
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