import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import InventoryPage from '@/views/inventory/ui/InventoryPage';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export const metadata: Metadata = {
  title: 'Inventario de Autos Nuevos y Usados | Richard Automotive',
  description:
    'Explora nuestro inventario completo de autos nuevos y usados en Vega Alta, Puerto Rico. Filtra por marca, modelo, precio y tipo de vehículo.',
  keywords: [
    'inventario autos',
    'buscar autos',
    'carros puerto rico',
    'richard automotive inventario',
  ],
  alternates: {
    canonical: 'https://richard-automotive.com/inventario',
  },
};

import { unstable_noStore as noStore } from 'next/cache';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

function InventoryJsonLd({ inventory }: { inventory: Car[] }) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://richard-automotive.com' },
      { '@type': 'ListItem', position: 2, name: 'Inventario', item: 'https://richard-automotive.com/inventario' },
    ],
  };

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Inventario de Autos Richard Automotive',
    description: 'Explora nuestra selección de autos nuevos Ford y usados certificados en Puerto Rico.',
    url: 'https://richard-automotive.com/inventario',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (inventory || []).slice(0, 12).map((car, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Car',
          name: `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || 'Vehículo',
          url: `${SITE_CONFIG.url}/inventario/${generateVehicleSlug(car)}/${car.id}`,
          offers: {
            '@type': 'Offer',
            price: car.price || 0,
            priceCurrency: 'USD',
          },
        },
      })),
    },
  };

  const schemas = [breadcrumb, collection];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default async function InventoryRoute() {
  noStore();
  let inventory: Car[] = [];

  try {
    const result = await getPaginatedCars(12, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return (
    <>
      <InventoryJsonLd inventory={inventory} />
      <main className="relative min-h-screen pt-24 bg-[#0a0a0a]">
        <Suspense
          fallback={
            <div className="flex h-[50vh] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          }
        >
          <InventoryPage inventory={inventory} />
        </Suspense>
      </main>
    </>
  );
}
