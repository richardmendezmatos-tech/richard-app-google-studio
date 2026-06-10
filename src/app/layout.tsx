import React from 'react';
import type { Metadata } from 'next';
import { Bebas_Neue, Sora, Manrope } from 'next/font/google';
import '@/index.css';
import Script from 'next/script';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cinematic',
  display: 'swap',
});
const sora = Sora({ subsets: ['latin'], variable: '--font-tech', display: 'swap' });
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Richard Automotive | Dealer de Autos Nuevos Ford en Puerto Rico',
  description:
    'Tu destino premium para autos nuevos Ford y usados certificados en Vega Alta, Puerto Rico. Richard Automotive ofrece financiamiento digital y tasaciones inteligentes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RichardAuto',
    startupImage: [
      {
        url: '/app-icon.webp',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    apple: '/app-icon.webp',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Richard Automotive | Dealer de Autos Nuevos en Puerto Rico',
    description:
      'Estrena tu Ford hoy con financiamiento inteligente en Richard Automotive Vega Alta.',
    images: ['https://www.richard-automotive.com/og-image.webp'],
    locale: 'es_PR',
    type: 'website',
  },
  alternates: {
    languages: {
      'es-PR': 'https://www.richard-automotive.com',
      en: 'https://www.richard-automotive.com/en',
    },
  },
};

export const viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

import { PerformanceInitializer } from '@/shared/lib/monitoring/PerformanceInitializer';
import HeroStaticContent from '@/features/inventory/ui/storefront/HeroStaticContent';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { getAutoDealerSchema } from '@/shared/config/seoSchemas';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = getAutoDealerSchema();

  const webmcpJsonLd = {
    '@context': 'https://schema.webmcp.dev',
    '@type': 'WebApplication',
    name: 'Richard Automotive',
    'mcp:tools': [
      {
        '@type': 'mcp:FormTool',
        name: 'pre-qualify',
        description: 'Pre-calificar cliente para financiamiento automotriz',
        url: '/precualificacion',
        'mcp:fields': ['name', 'phone', 'email', 'income'],
      },
      {
        '@type': 'mcp:FormTool',
        name: 'bono-300',
        description: 'Reclamar bono de $300 para gastos de cierre',
        url: '/bono-300',
        'mcp:fields': ['name', 'phone', 'email'],
      },
      {
        '@type': 'mcp:FormTool',
        name: 'trade-in',
        description: 'Tasación de vehículo para trade-in',
        url: '/trade-in',
        'mcp:fields': ['year', 'make', 'model', 'mileage', 'condition'],
      },
    ],
  };

  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${sora.variable} ${manrope.variable} antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/hero.avif" fetchPriority="high" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="icon" href="/favicon.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/app-icon.webp" />
        <meta name="google-site-verification" content="-Gsbiu2xa3UZQ9sCSRb-P2Zk2boNjtO6o2849bdY1Dw" />
        <meta name="mcp:tool" content="pre-qualify" />
        <meta name="mcp:tool" content="bono-300" />
        <meta name="mcp:tool" content="trade-in" />
        <meta name="mcp:tool" content="contact" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webmcpJsonLd) }}
        />
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
        <img
          src="/hero.avif"
          alt=""
          fetchPriority="high"
          className="fixed inset-0 w-full h-full object-cover opacity-30 -z-10 pointer-events-none"
          aria-hidden="true"
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-cyan-500 focus:text-black focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <PerformanceInitializer />
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="e2e-bypass-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `if (!localStorage.getItem('e2e_bypass')) localStorage.setItem('e2e_bypass', 'true');`,
            }}
          />
        )}
        <HeroStaticContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=document.getElementById('hero-content');if(h&&location.pathname!=='/'&&location.pathname!=='/en'){h.style.display='none'}})();`,
          }}
        />
        <main id="main-content" className="relative z-0">
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
