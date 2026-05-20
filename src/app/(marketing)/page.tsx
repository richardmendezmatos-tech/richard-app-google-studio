import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Storefront from '@/pages/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { SessionRecoveryBridge } from '@/features/auth/ui/SessionRecoveryBridge';

const ContactInfoSection = dynamic(
  () => import('@/pages/storefront/ui/ContactInfoSection'),
  { ssr: false },
);

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
    canonical: 'https://richard-automotive.com/',
  },
  openGraph: {
    title: 'Richard Automotive | Dealer de Autos Nuevos y Usados Certificados',
    description:
      'Ubicados en Central Ford, Vega Alta. Concesionario oficial de autos nuevos y selección premium de usados.',
    url: 'https://richard-automotive.com/',
    siteName: 'Richard Automotive',
    images: [
      {
        url: 'https://richard-automotive.com/og-image.jpg',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: BUSINESS_CONTACT.name,
    legalName: BUSINESS_CONTACT.legalName,
    url: 'https://richard-automotive.com',
    logo: 'https://richard-automotive.com/logo.png',
    image: 'https://richard-automotive.com/dealership-front.jpg',
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Next.js App Router Home Page
 * Optimized for Local SEO and Strategic Conversion.
 */
export const revalidate = 60;

export default async function HomePage() {
  let inventory: any[] = [];

  try {
    const result = await getPaginatedCars(12, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return (
    <>
      <HomeJsonLd />

      <main className="relative">
        <SessionRecoveryBridge />
        <Suspense fallback={null}>
          <Storefront inventory={inventory} />
        </Suspense>

        <Suspense fallback={null}>
          <ContactInfoSection />
        </Suspense>
      </main>
    </>
  );
}


