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
  title: 'Richard Automotive | Master Control Center',
  description: 'Inventario de vehículos premium y tasaciones digitales. Gestión por Richard Oneal Méndez Matos.',
  manifest: '/manifest.json',
  themeColor: '#020617',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RichardAuto',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Richard Automotive',
    description: 'Expertos en automovilismo y tecnología.',
    images: ['https://richard-automotive.com/og-image.jpg'],
  },
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
    '@type': 'Person',
    name: 'Richard Oneal Méndez Matos',
    url: 'https://richard-automotive.com',
    sameAs: [
      'https://linkedin.com/in/richardmendez',
      'https://instagram.com/richardautomotive',
    ],
    jobTitle: 'Especialista en Sistemas Automotrices',
    worksFor: {
      '@type': 'Organization',
      name: 'Richard Automotive',
    },
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
