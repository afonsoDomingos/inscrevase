import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ['400', '500', '600', '700', '800', '900']
}); const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ['400', '600', '700', '800']
});

export const metadata: Metadata = {
  title: "Inscreva-se | Plataforma de Eventos de Luxo",
  description: "Plataforma premium para mentores, palestrantes e organizadores de eventos em todo o mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
        <LanguageProvider>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </LanguageProvider>
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}
