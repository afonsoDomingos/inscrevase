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
import GlobalMetaPixel from '@/components/GlobalMetaPixel';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ThemeProvider } from '@/context/ThemeContext';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import HealthCheck from '@/components/common/HealthCheck';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import PayPalProviderWrapper from '@/components/common/PayPalProviderWrapper';
import OfflineDetector from '@/components/common/OfflineDetector';

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
    default: "Inscreva-se | Plataforma de Criação e Gestão de Eventos",
    template: "%s | Inscreva-se"
  },
  description: "A plataforma líder em criação e gestão de eventos em Angola e Moçambique. Crie formulários de inscrição, venda bilhetes online, gerencie participantes e processe pagamentos de forma segura. Ideal para mentores, palestrantes, coaches e organizadores de eventos.",
  keywords: [
    // Português - Eventos
    "gestão de eventos", "criar eventos online", "plataforma de eventos", "organização de eventos",
    "eventos em Angola", "eventos em Moçambique", "eventos em Portugal", "eventos África",
    // Português - Inscrições
    "inscrição online", "formulário de inscrição", "sistema de inscrições", "registo de participantes",
    "check-in de eventos", "lista de participantes", "gestão de convidados",
    // Português - Bilhetes
    "venda de bilhetes", "bilhetes online", "ingressos online", "ticketing",
    "bilheteira online", "comprar bilhetes", "vender ingressos",
    // Português - Mentoria e Formação
    "plataforma para mentores", "cursos online", "workshops", "seminários",
    "formação profissional", "palestras", "masterclass", "webinars",
    // Português - Pagamentos
    "pagamentos online Angola", "pagamentos online Moçambique", "multicaixa express",
    "mpesa pagamentos", "emis pagamentos", "pagamentos seguros",
    // Inglês - General
    "event management platform", "online registration", "ticket sales", "event ticketing",
    "attendee management", "event check-in", "event analytics",
    // Marca
    "Inscreva-se", "inscrevase", "inscreva-se.com"
  ],
  authors: [{ name: "Inscreva-se", url: "https://inscreva-se.com" }],
  creator: "Inscreva-se",
  publisher: "Inscreva-se",
  category: "Technology",
  classification: "Event Management Software",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["pt_BR", "pt_AO", "pt_MZ", "en_US"],
    url: 'https://inscreva-se.com',
    title: "Inscreva-se | Plataforma de Criação e Gestão de Eventos",
    description: "A plataforma líder em criação e gestão de eventos. Crie formulários de inscrição, venda bilhetes online e gerencie participantes facilmente. Ideal para mentores, palestrantes e organizadores.",
    siteName: "Inscreva-se",
    countryName: "Angola",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Inscreva-se - Plataforma de Criação e Gestão de Eventos",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inscrevase",
    creator: "@inscrevase",
    title: "Inscreva-se | Plataforma de Criação e Gestão de Eventos",
    description: "Crie eventos, venda bilhetes e gerencie participantes. A plataforma completa para organizadores de eventos em Angola, Moçambique e Portugal.",
    images: [
      {
        url: '/og-image.png',
        alt: "Inscreva-se - Plataforma de Eventos",
      }
    ],
  },
  alternates: {
    canonical: 'https://inscreva-se.com',
    languages: {
      'pt': 'https://inscreva-se.com',
      'pt-PT': 'https://inscreva-se.com',
      'pt-BR': 'https://inscreva-se.com',
      'pt-AO': 'https://inscreva-se.com',
      'pt-MZ': 'https://inscreva-se.com',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'verification_code_here',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || 'bing_verification_code',
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION || 'facebook_verification_code',
    },
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
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'AO',
    'geo.placename': 'Luanda',
    'geo.position': '-8.839988;13.289437',
    'ICBM': '-8.839988, 13.289437',
    'revisit-after': '7 days',
    'rating': 'General',
    'distribution': 'Global',
    'language': 'Portuguese',
    'coverage': 'Worldwide',
    'target': 'all',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
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
        {/* Script para prevenir o Flash (piscar) de tema branco ao carregar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var theme = savedTheme;
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') document.body.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}>
        {/* Schema.org - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://inscreva-se.com/#organization",
              "name": "Inscreva-se",
              "alternateName": ["Inscrevase", "Inscreva.se"],
              "url": "https://inscreva-se.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://inscreva-se.com/logo.png",
                "width": 512,
                "height": 512
              },
              "image": "https://inscreva-se.com/og-image.png",
              "description": "A plataforma líder em criação e gestão de eventos em Angola e Moçambique. Crie formulários de inscrição, venda bilhetes online e gerencie participantes.",
              "slogan": "Crie, Gerencie e Escale os seus Eventos",
              "foundingDate": "2024",
              "areaServed": [
                { "@type": "Country", "name": "Angola" },
                { "@type": "Country", "name": "Moçambique" },
                { "@type": "Country", "name": "Portugal" },
                { "@type": "Country", "name": "Brasil" }
              ],
              "serviceType": ["Event Management", "Ticketing", "Registration Platform"],
              "sameAs": [
                "https://facebook.com/inscrevase",
                "https://instagram.com/inscrevase",
                "https://linkedin.com/company/inscrevase",
                "https://twitter.com/inscrevase",
                "https://youtube.com/@inscrevase"
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+258856079576",
                  "contactType": "customer service",
                  "areaServed": ["AO", "MZ", "PT", "BR"],
                  "availableLanguage": ["Portuguese", "English"]
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Luanda",
                "addressCountry": "AO"
              }
            })
          }}
        />

        {/* Schema.org - WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://inscreva-se.com/#website",
              "name": "Inscreva-se",
              "alternateName": "Plataforma de Criação e Gestão de Eventos",
              "url": "https://inscreva-se.com",
              "description": "Crie eventos, venda bilhetes e gerencie participantes facilmente",
              "publisher": { "@id": "https://inscreva-se.com/#organization" },
              "inLanguage": ["pt-PT", "pt-BR", "pt-AO", "en"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://inscreva-se.com/experts?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Schema.org - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Inscreva-se",
              "applicationCategory": "BusinessApplication",
              "applicationSubCategory": "Event Management",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Plano gratuito disponível"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "Criação de formulários de inscrição",
                "Venda de bilhetes online",
                "Gestão de participantes",
                "Check-in com QR Code",
                "Relatórios e analytics",
                "Pagamentos seguros",
                "Integração com Multicaixa e M-Pesa"
              ],
              "screenshot": "https://inscreva-se.com/dashboard-preview.png",
              "author": { "@id": "https://inscreva-se.com/#organization" }
            })
          }}
        />

        {/* Schema.org - FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "O que é o Inscreva-se?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "O Inscreva-se é uma plataforma completa para criar e gerir eventos online. Permite criar formulários de inscrição, vender bilhetes, gerir participantes e processar pagamentos de forma segura."
                  }
                },
                {
                  "@type": "Question",
                  "name": "O Inscreva-se é gratuito?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim, o Inscreva-se oferece um plano gratuito que permite criar eventos e receber inscrições. Também temos planos premium com funcionalidades avançadas para organizadores profissionais."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Quais métodos de pagamento são aceitos?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Aceitamos diversos métodos de pagamento incluindo Multicaixa Express, M-Pesa, transferência bancária, e cartões de crédito/débito internacionais."
                  }
                },
                {
                  "@type": "Question",
                  "name": "O Inscreva-se funciona em Angola e Moçambique?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim! O Inscreva-se foi desenvolvido especialmente para o mercado africano lusófono, com suporte completo para Angola, Moçambique, Portugal e Brasil."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Como faço check-in dos participantes?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "O Inscreva-se gera QR Codes únicos para cada participante. No dia do evento, basta escanear o código com o nosso app ou câmera do celular para fazer o check-in instantâneo."
                  }
                }
              ]
            })
          }}
        />

        {/* Schema.org - BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Início",
                  "item": "https://inscreva-se.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Eventos",
                  "item": "https://inscreva-se.com/eventos"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Mentores",
                  "item": "https://inscreva-se.com/experts"
                }
              ]
            })
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <SocketProvider>
                <PayPalProviderWrapper>
                  <LoadingScreen />
                  <HealthCheck />
                  <OfflineDetector />
                  <ClientLayoutWrapper>
                    <Suspense fallback={null}>
                      <AnalyticsTracker />
                      <GlobalMetaPixel />
                    </Suspense>
                    {children}
                    <WhatsAppFloat />
                    <PWAInstallPrompt />
                  </ClientLayoutWrapper>
                </PayPalProviderWrapper>
              </SocketProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}