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
    default: "Inscreva-se | Plataforma de Eventos de Luxo",
    template: "%s | Inscreva-se"
  },
  description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo. Crie, gerencie e escale seus eventos com elegância.",
  keywords: ["eventos", "mentoria", "workshop", "tickets", "ingressos", "luxo", "premium", "gestão de eventos"],
  authors: [{ name: "Inscreva.se Team" }],
  creator: "Inscreva.se",
  publisher: "Inscreva.se",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: 'https://inscreva-se.com',
    title: "Inscreva-se | Plataforma de Eventos de Luxo",
    description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo.",
    siteName: "Inscreva-se",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Inscreva-se Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inscreva-se | Plataforma de Eventos de Luxo",
    description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo.",
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
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