import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/views/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

// ── Tactical Data for Brand + City Market Domination ──
const CITIES: Record<string, { name: string; slug: string; region: string; zipCodes: string[] }> = {
  'vega-alta': { name: 'Vega Alta', slug: 'vega-alta', region: 'Norte', zipCodes: ['00692'] },
  'bayamon': { name: 'Bayamón', slug: 'bayamon', region: 'Zona Metro', zipCodes: ['00956'] },
  'san-juan': { name: 'San Juan', slug: 'san-juan', region: 'Capital', zipCodes: ['00901'] },
};

const BRANDS: Record<string, { name: string; slug: string; keywords: string[] }> = {
  'ford': { name: 'Ford', slug: 'ford', keywords: ['F-150', 'Explorer', 'Mustang', 'Ranger'] },
  'hyundai': { name: 'Hyundai', slug: 'hyundai', keywords: ['Tucson', 'Elantra', 'Santa Fe', 'Palisade'] },
  'freightliner': { name: 'Freightliner', slug: 'freightliner', keywords: ['M2 106', 'Cascadia', 'Business Class'] },
  'toyota': { name: 'Toyota', slug: 'toyota', keywords: ['Tacoma', 'Corolla', 'RAV4', 'Highlander'] },
};

interface Props {
  params: Promise<{ city: string; brand: string }>;
}

export async function generateStaticParams() {
  const params: any[] = [];
  Object.keys(CITIES).forEach((city) => {
    Object.keys(BRANDS).forEach((brand) => {
      params.push({ city, brand });
    });
  });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, brand: brandSlug } = await params;
  const city = CITIES[citySlug];
  const brand = BRANDS[brandSlug];
  
  if (!city || !brand) return {};

  const title = `Venta de ${brand.name} en ${city.name}, PR | Richard Automotive`;
  const description = `Buscas un ${brand.name} en ${city.name}? Richard Automotive tiene el mejor inventario de ${brand.name} usados y certificados en la zona de ${city.region}. Financiamiento desde 4.9% APR y aprobación rápida.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/${city.slug}/${brand.slug}`,
    },
  };
}

export default async function CityBrandPage({ params }: Props) {
  const { city: citySlug, brand: brandSlug } = await params;
  const city = CITIES[citySlug];
  const brand = BRANDS[brandSlug];

  if (!city || !brand) {
    notFound();
  }

  let inventory: Car[] = [];
  try {
    const result = await getPaginatedCars(50);
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for city+brand page:', error);
  }
  
  // High-performance filter
  const filteredInventory = inventory.filter((car: Car) => 
    car.name.toLowerCase().includes(brand.slug.toLowerCase())
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive — ${brand.name} en ${city.name}`,
    description: `Dealer especializado en ${brand.name} para residentes de ${city.name}, Puerto Rico.`,
    url: `https://richard-automotive.com/autos-usados/${city.slug}/${brand.slug}`,
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
          customTitle={`Inventario ${brand.name} en ${city.name}, PR`}
          customDescription={`Disfruta de la mejor selección de unidades ${brand.name} en ${city.name}. Solo en Richard Automotive.`}
        />
      </Suspense>
    </>
  );
}
