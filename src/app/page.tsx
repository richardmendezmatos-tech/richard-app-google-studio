import React from 'react';
import Storefront from '@/pages/storefront/ui/Storefront';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';

// Esta página se renderiza en el servidor por defecto (App Router)
export default async function HomePage() {
  let inventory = [];
  
  try {
    // SSR: Fetching data directly from GCP Java Backend before shipping HTML
    inventory = await fetchInventoryFromJava(12);
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
    // Fallback info or handle error
  }

  return (
    <Storefront 
      inventory={inventory}
    />
  );
}
