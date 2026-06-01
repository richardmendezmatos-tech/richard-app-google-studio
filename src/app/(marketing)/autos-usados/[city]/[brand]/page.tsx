import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/views/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { CITIES_PR as CITIES } from '@/shared/config/cities';

interface Props {
  params: Promise<{ city: string; brand: string }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, brand: brandSlug } = await params;
  const city = CITIES[citySlug];
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);

  if (!city) return {};

  const title = `Venta de ${brandName} en ${city.name}, PR | Richard Automotive`;
  const description = `Buscas un ${brandName} en ${city.name}? Richard Automotive tiene el mejor inventario de ${brandName} usados y certificados en la zona de ${city.region}. Financiamiento desde 4.9% APR y aprobación rápida.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.richard-automotive.com/autos-usados/${city.slug}/${brandSlug}`,
    },
  };
}

export default async function CityBrandPage({ params }: Props) {
  const { city: citySlug, brand: brandSlug } = await params;
  const city = CITIES[citySlug];
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);

  if (!city) {
    notFound();
  }

  let inventory: Car[] = [];
  try {
    const result = await getPaginatedCars(100, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for city+brand page:', error);
  }

  // High-performance filter by brand
  const filteredInventory = inventory.filter((car: Car) =>
    (car.make || '').toLowerCase() === brandSlug.toLowerCase(),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive — ${brandName} en ${city.name}`,
    description: `Dealer especializado en ${brandName} para residentes de ${city.name}, Puerto Rico.`,
    url: `https://www.richard-automotive.com/autos-usados/${city.slug}/${brandSlug}`,
    telephone: BUSINESS_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: 'PR',
      postalCode: city.zipCodes[0],
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONTACT.geo.latitude,
      longitude: BUSINESS_CONTACT.geo.longitude,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <Storefront
          inventory={filteredInventory}
          customTitle={`Inventario ${brandName} en ${city.name}, PR`}
          customDescription={`Disfruta de la mejor selección de unidades ${brandName} en ${city.name}. Solo en Richard Automotive.`}
        />
      </Suspense>
    </>
  );
}
