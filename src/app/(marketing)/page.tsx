import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPaginatedCars, getDistinctFordModels } from '@/entities/inventory/api/adapters/serverInventoryService';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { SessionRecoveryBridge } from '@/features/auth/ui/SessionRecoveryBridge';
import HeroBackground from '@/features/inventory/ui/storefront/HeroBackground';
import { LazyStorefrontContent } from '@/views/storefront/ui/LazyStorefrontContent';
import TrustBar from '@/features/inventory/ui/storefront/TrustBar';
import FAQSection from '@/shared/ui/components/FAQSection';
import TestimonialsSection from '@/features/inventory/ui/storefront/TestimonialsSection';
import StatsStrip from '@/shared/ui/components/StatsStrip';
import FordCarouselStrip from '@/features/inventory/ui/storefront/FordCarouselStrip';

function FordModelQuickLinksSkeleton() {
  return (
    <section className="relative z-10 -mt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4 overflow-hidden pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 w-48 bg-slate-900/40 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-slate-800 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-2 bg-slate-800 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-slate-800/50 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InventorySectionSkeleton() {
  return (
    <div className="min-h-[1600px] bg-slate-900/20 rounded-3xl mx-6 animate-pulse" />
  );
}

async function InventorySection() {
  let inventory: any[] = [];

  try {
    const result = await getPaginatedCars(12, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return <LazyStorefrontContent inventory={inventory} />;
}

async function FordModelQuickLinks() {
  const models = await getDistinctFordModels();
  if (models.length === 0) return null;
  return <FordCarouselStrip models={models} />;
}

export const metadata: Metadata = {
  title: 'Richard Automotive | Dealer de Autos Nuevos y Usados en Vega Alta',
  description:
    'Tu concesionario de confianza para autos nuevos y usados de lujo en Central Ford, Vega Alta. Financiamiento expreso y el inventario más exclusivo de Puerto Rico.',
  keywords: [
    'autos nuevos puerto rico',
    'autos usados puerto rico',
    'dealer vega alta',
    'central ford vega alta',
    'richard automotive',
    'guaguas nuevas',
    'pickups nuevas',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/',
  },
  openGraph: {
    title: 'Richard Automotive | Dealer de Autos Nuevos y Usados Certificados',
    description:
      'Ubicados en Central Ford, Vega Alta. Concesionario oficial de autos nuevos y selección premium de usados.',
    url: 'https://www.richard-automotive.com/',
    siteName: 'Richard Automotive',
    images: [
      {
        url: 'https://www.richard-automotive.com/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Richard Automotive Storefront',
      },
    ],
    locale: 'es_PR',
    type: 'website',
  },
};

function HomeJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.richard-automotive.com' },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: BUSINESS_CONTACT.name,
    legalName: BUSINESS_CONTACT.legalName,
    url: 'https://www.richard-automotive.com',
    logo: 'https://www.richard-automotive.com/logo.png',
    image: 'https://www.richard-automotive.com/dealership-front.jpg',
    description:
      'Dealer de autos usados certificados, especializado en pickups y guaguas de lujo. Ubicado en las facilidades de Central Ford.',
    telephone: BUSINESS_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONTACT.address.street,
      addressLocality: BUSINESS_CONTACT.address.city,
      addressRegion: BUSINESS_CONTACT.address.state,
      postalCode: BUSINESS_CONTACT.address.zip,
      addressCountry: BUSINESS_CONTACT.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONTACT.geo.latitude,
      longitude: BUSINESS_CONTACT.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    sameAs: [BUSINESS_CONTACT.social.facebook, BUSINESS_CONTACT.social.instagram],
    priceRange: '$$$',
    areaServed: {
      '@type': 'Country',
      name: 'Puerto Rico',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />

      <main className="relative">
        <SessionRecoveryBridge />
        <HeroBackground />
        <Suspense fallback={<FordModelQuickLinksSkeleton />}>
          <FordModelQuickLinks />
        </Suspense>
        <Suspense fallback={<InventorySectionSkeleton />}>
          <InventorySection />
        </Suspense>
      </main>

      <StatsStrip />
      <TrustBar />
      <FAQSection />
      <TestimonialsSection />
    </>
  );
}
