import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SocketProvider } from '@/context/SocketContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
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
  title: "Inscreva-se | Plataforma de Eventos de Luxo",
  description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo.",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

import { Suspense } from "react";

import MetaPixel from '@/components/MetaPixel';

// ... (existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
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
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}
