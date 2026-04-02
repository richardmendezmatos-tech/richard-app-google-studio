import React from 'react';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/index.css';
import { AppProviders } from '@/widgets/brand-ui/providers/AppProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Richard Automotive | Master Control Center',
  description: 'Inventario de vehículos premium y tasaciones digitales. Gestión por Richard Oneal Méndez Matos.',
  openGraph: {
    title: 'Richard Automotive',
    description: 'Expertos en automovilismo y tecnología.',
    images: ['https://richard-automotive.com/og-image.jpg'],
  },
};

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
    <html lang="es" className={`${inter.className} ${outfit.variable}`}>
      {/* Metadata is handled by Next.js Metadata API */}
      <head />
      <body className="bg-slate-950 text-white min-h-screen">
        <Script
          id="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="e2e-bypass-script"
            dangerouslySetInnerHTML={{
              __html: `if (!localStorage.getItem('e2e_bypass')) localStorage.setItem('e2e_bypass', 'true');`,
            }}
          />
        )}
        <AppProviders>
          <CinemaLayout inventory={[]}>
            {children}
          </CinemaLayout>
        </AppProviders>
      </body>
    </html>
  );
}
