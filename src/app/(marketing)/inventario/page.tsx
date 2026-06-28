import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import InventoryPage from '@/views/inventory/ui/InventoryPage';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { InventoryAlertBanner } from '@/widgets/brand-ui/layout/conversion/InventoryAlertBanner';

const BASE_URL = 'https://www.richard-automotive.com';

type SearchParams = Promise<{
  make?: string; model?: string; q?: string;
  type?: string; sort?: string; order?: string;
  year?: string; mileage?: string;
}>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;

  if (params.type === 'nuevos') {
    return {
      title: 'Autos Nuevos Ford en Puerto Rico | Richard Automotive',
      description: 'Compra tu Ford nuevo con garantía de fábrica y Ford Credit en Richard Automotive, Vega Alta. Financiamiento desde 4.9% APR.',
      keywords: ['autos nuevos ford puerto rico', 'ford nuevos vega alta', 'comprar ford nuevo pr'],
      alternates: { canonical: `${BASE_URL}/inventario?type=nuevos` },
    };
  }

  if (params.type === 'usados') {
    return {
      title: 'Autos Usados Certificados Puerto Rico | Richard Automotive',
      description: 'Selección premium de autos usados certificados con garantía Richard Automotive en Puerto Rico. Precios competitivos y financiamiento disponible.',
      keywords: ['autos usados certificados puerto rico', 'carros usados vega alta', 'usados garantizados pr'],
      alternates: { canonical: `${BASE_URL}/inventario?type=usados` },
    };
  }

  const q = params.q || [params.make, params.model].filter(Boolean).join(' ');
  if (q) {
    return {
      title: `${q} en Venta Puerto Rico | Richard Automotive`,
      description: `Encuentra ${q} nuevo o usado en Richard Automotive. Financiamiento disponible. Vega Alta, Puerto Rico.`,
      alternates: { canonical: `${BASE_URL}/inventario?q=${encodeURIComponent(q)}` },
    };
  }

  return {
    title: 'Inventario de Autos Nuevos y Usados | Richard Automotive',
    description: 'Explora nuestro inventario completo de autos nuevos y usados en Vega Alta, Puerto Rico. Filtra por marca, modelo, precio y tipo de vehículo.',
    keywords: ['inventario autos', 'buscar autos', 'carros puerto rico', 'richard automotive inventario'],
    alternates: { canonical: `${BASE_URL}/inventario` },
  };
}

import { generateVehicleSlug } from '@/shared/lib/utils/seo';

export const revalidate = 3600;

function InventoryJsonLd({ inventory }: { inventory: Car[] }) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.richard-automotive.com' },
      { '@type': 'ListItem', position: 2, name: 'Inventario', item: 'https://www.richard-automotive.com/inventario' },
    ],
  };

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Inventario de Autos Richard Automotive',
    description: 'Explora nuestra selección de autos nuevos Ford y usados certificados en Puerto Rico.',
    url: 'https://www.richard-automotive.com/inventario',
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

  const prices = (inventory || []).map((c) => c.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 5000;
  const maxPrice = prices.length ? Math.max(...prices) : 80000;
  const aggregateOffer = {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    name: 'Inventario de Autos Richard Automotive',
    offerCount: inventory?.length || 0,
    lowPrice: minPrice,
    highPrice: maxPrice,
    priceCurrency: 'USD',
    seller: {
      '@type': 'AutoDealer',
      name: 'Richard Automotive',
      url: 'https://www.richard-automotive.com',
    },
  };

  const schemas = [breadcrumb, collection, aggregateOffer];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default async function InventoryRoute({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialSearchTerm = params.q || [params.make, params.model].filter(Boolean).join(' ');
  const initialFilter = params.type || 'all';
  const initialSortBy = params.sort || 'price';
  const initialSortOrder = (params.order === 'asc' || params.order === 'desc') ? params.order : null;
  const initialYear = params.year ? parseInt(params.year) : ('all' as const);
  const initialMileage = params.mileage ? parseInt(params.mileage) : ('all' as const);

  let inventory: Car[] = [];

  try {
    const result = await getPaginatedCars(12, null, initialFilter, initialSortOrder, initialSearchTerm || undefined);
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
          <InventoryPage
            inventory={inventory}
            initialSearchTerm={initialSearchTerm}
            initialFilter={initialFilter}
            initialSortBy={initialSortBy}
            initialSortOrder={initialSortOrder}
            initialYear={initialYear}
            initialMileage={initialMileage}
          />
        </Suspense>
        <InventoryAlertBanner />
      </main>
    </>
  );
}
