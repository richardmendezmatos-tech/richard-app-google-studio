import React from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/index.css';
import { AppProviders } from '@/widgets/brand-ui/providers/AppProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

// Essential Project Fonts
import { Bebas_Neue, Sora, Manrope, Cormorant_Garamond } from 'next/font/google';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-cinematic', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-tech', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const cormorant = Cormorant_Garamond({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-editorial', display: 'swap' });

export const metadata: Metadata = {
  title: 'Richard Automotive | Dealer de Autos Nuevos Ford en Puerto Rico',
  description: 'Tu destino premium para autos nuevos Ford y usados certificados en Bayamón, Puerto Rico. Richard Automotive ofrece financiamiento digital y tasaciones inteligentes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RichardAuto',
    startupImage: [
      {
        url: '/app-icon.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    apple: '/app-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Richard Automotive | Dealer de Autos Nuevos en Puerto Rico',
    description: 'Estrena tu Ford hoy con financiamiento inteligente en Richard Automotive Bayamón.',
    images: ['https://richard-automotive.com/og-image.jpg'],
    locale: 'es_PR',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScaleable: false,
  viewportFit: 'cover',
};

import { PerformanceInitializer } from '@/shared/lib/monitoring/PerformanceInitializer';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Richard Automotive',
    image: 'https://richard-automotive.com/logo.png',
    '@id': 'https://richard-automotive.com',
    url: 'https://richard-automotive.com',
    telephone: '+17873682880',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bayamón',
      addressLocality: 'Bayamón',
      addressRegion: 'PR',
      postalCode: '00956',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.3973,
      longitude: -66.1558,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://www.facebook.com/richardautomotive1',
      'https://www.instagram.com/richardoneal_/',
    ],
  };

  return (
    <html 
      lang="es" 
      className={`${inter.variable} ${outfit.variable} ${bebasNeue.variable} ${sora.variable} ${manrope.variable} ${cormorant.variable} antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/hero.avif" fetchPriority="high" />
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
        <PerformanceInitializer />
        <Script
          id="person-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="e2e-bypass-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `if (!localStorage.getItem('e2e_bypass')) localStorage.setItem('e2e_bypass', 'true');`,
            }}
          />
        )}
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
