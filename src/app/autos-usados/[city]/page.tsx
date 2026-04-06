import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { notFound } from 'next/navigation';

// Tactical City Data for PR Dominance
const CITIES: Record<string, { name: string, slug: string, meta: string }> = {
  'bayamon': { name: 'Bayamón', slug: 'bayamon', meta: 'el Dealer #1 de Bayamón' },
  'san-juan': { name: 'San Juan', slug: 'san-juan', meta: 'exclusividad en la Capital' },
  'guaynabo': { name: 'Guaynabo', slug: 'guaynabo', meta: 'unidades de lujo en Guaynabo City' },
  'ponce': { name: 'Ponce', slug: 'ponce', meta: 'la Perla del Sur con Richard Automotive' },
  'caguas': { name: 'Caguas', slug: 'caguas', meta: 'financiamiento expreso en el Turabo' },
};

export async function generateStaticParams() {
  return Object.values(CITIES).map((city) => ({
    city: city.slug,
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = CITIES[params.city];
  if (!city) return {};

  return {
    title: `Autos Usados en ${city.name}, PR | Richard Automotive ${city.name}`,
    description: `Los mejores autos usados y guaguas de lujo en ${city.name}, Puerto Rico. Richard Automotive es ${city.meta}. Aprobación en 24h y trade-in garantizado.`,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/${city.slug}`,
    },
    openGraph: {
      title: `Richard Automotive ${city.name} | Inventario de Lujo`,
      description: `Explora el inventario más exclusivo de ${city.name}. Autos certificados con el sello Richard.`,
    }
  };
}

/**
 * Programmatic SEO Page - City Specific
 * This page leverages the main Storefront but optimizes for local search intent.
 */
export default async function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES[params.city];
  
  if (!city) {
    notFound();
  }

  let inventory: any[] = [];
  
  try {
    // Fetch initial inventory for SSR
    inventory = await fetchInventoryFromJava(12);
  } catch (error) {
    console.error(`[SEO Page: ${city.name}] Error fetching inventory:`, error);
  }

  return (
    <Suspense fallback={null}>
      <Storefront 
        inventory={inventory} 
        customTitle={`Autos Usados en ${city.name}, PR | Richard Automotive`}
        customDescription={`Los mejores autos usados y guaguas de lujo en ${city.name}, Puerto Rico. Richard Automotive es ${city.meta}. Aprobación en 24h.`}
      />
    </Suspense>
  );
}
