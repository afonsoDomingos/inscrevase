import './globals.css';
import { Inter, Playfair_Display, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins' });

export const metadata = {
  title: "Inscreva-se | Plataforma de Eventos de Luxo",
  description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo.",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

import { Suspense } from "react";

import MetaPixel from '@/components/MetaPixel';

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