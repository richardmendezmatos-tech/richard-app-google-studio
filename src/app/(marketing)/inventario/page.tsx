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

import { generateVehicleSlug } from '@/shared/lib/utils/seo';

export const revalidate = 30;

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

export default async function InventoryRoute({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string }>;
}) {
  const params = await searchParams;
  const initialSearchTerm = [params.make, params.model].filter(Boolean).join(' ');

  let inventory: Car[] = [];

  try {
    const result = await getPaginatedCars(12, null, 'all', null, initialSearchTerm || undefined);
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
            <div className="w-full p-4 md:p-6 lg:p-8 space-y-8 animate-pulse">
              <div className="h-16 w-full rounded-2xl bg-white/5 border border-white/5" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col rounded-3xl border border-white/5 bg-slate-900/50 p-5 space-y-4">
                    <div className="w-full aspect-[16/10] rounded-2xl bg-white/5" />
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded-lg bg-white/5" />
                      <div className="h-4 w-1/2 rounded-lg bg-white/5" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-5 w-16 rounded-full bg-white/5" />
                      <div className="h-5 w-16 rounded-full bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <InventoryPage inventory={inventory} initialSearchTerm={initialSearchTerm} />
        </Suspense>
      </main>
    </>
  );
}
