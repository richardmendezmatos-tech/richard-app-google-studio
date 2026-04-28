import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import InventoryPage from '@/views/inventory/ui/InventoryPage';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

export const metadata: Metadata = {
  title: 'Inventario de Autos Nuevos y Usados | Richard Automotive',
  description: 'Explora nuestro inventario completo de autos nuevos y usados en Vega Alta, Puerto Rico. Filtra por marca, modelo, precio y tipo de vehículo.',
  keywords: ['inventario autos', 'buscar autos', 'carros puerto rico', 'richard automotive inventario'],
  alternates: {
    canonical: 'https://richard-automotive.com/inventario',
  },
};

import { unstable_noStore as noStore } from 'next/cache';

export default async function InventoryRoute() {
  noStore();
  let inventory: Car[] = [];

  
  try {
    const result = await getPaginatedCars(12);
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return (
    <main className="relative min-h-screen pt-24 bg-[#0a0a0a]">
      <Suspense fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      }>
        <InventoryPage inventory={inventory} />
      </Suspense>
    </main>
  );
}
