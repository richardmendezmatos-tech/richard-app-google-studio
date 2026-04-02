import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';

export const metadata: Metadata = {
  title: 'Richard Automotive | Inventario Premium Puerto Rico',
  description: 'Compra autos, guaguas y pickups de lujo con financiamiento expreso. El inventario más exclusivo de Bayamón.',
  alternates: {
    canonical: 'https://richard-automotive.com/',
  },
};

/**
 * Next.js App Router Home Page
 * Employs SSR for the initial inventory fetch to guarantee SEO and fast LCP.
 */
export default async function HomePage() {
  let inventory: any[] = [];
  
  try {
    // SSR: Direct data fetch to populate the Client component with dehydrated state
    inventory = await fetchInventoryFromJava(12);
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return (
    <Suspense fallback={null}>
      <Storefront inventory={inventory} />
    </Suspense>
  );
}
