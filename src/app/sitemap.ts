import { MetadataRoute } from 'next';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

const SITE_URL = 'https://richard-automotive.com';

/**
 * Dynamic Sitemap Generator for Richard Automotive.
 * Automatically indexes all vehicles from the GCP Java Backend.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/consultant`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/precualificacion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Inventory from Java Backend (App Router allows fetching during sitemap generation)
    const inventory = await fetchInventoryFromJava(100);
    
    const inventoryRoutes: MetadataRoute.Sitemap = inventory.map((car) => ({
      url: `${SITE_URL}/v/${generateVehicleSlug(car)}/${car.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...inventoryRoutes];
  } catch (error) {
    console.error('Sitemap Error:', error);
    return staticRoutes;
  }
}
