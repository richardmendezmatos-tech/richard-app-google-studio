import { MetadataRoute } from 'next';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

const SITE_URL = 'https://richard-automotive.com';
export const revalidate = 86400; // Revalidate sitemap every 24 hours

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
    // Programmatic SEO: Top PR Cities (Dominio de Mercado)
    ...['bayamon', 'san-juan', 'guaynabo', 'ponce', 'caguas'].map(city => ({
      url: `${SITE_URL}/autos-usados/${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];

  // Configuration Check for SEO Health
  const hasConfig = process.env.INTERNAL_API_URL && 
                   process.env.INTERNAL_API_KEY && 
                   process.env.INTERNAL_API_KEY !== 'PLACEHOLDER_CHANGE_ME';

  if (!hasConfig) {
    console.warn('⚠️ Sitemap Generation: Internal API Configuration is missing or using placeholder. Dynamic routes skipped.');
    return staticRoutes;
  }

  try {
    // Inventory from Java Backend
    const inventory = await fetchInventoryFromJava(100);
    
    if (!Array.isArray(inventory) || inventory.length === 0) {
      console.warn('⚠️ Sitemap Generation: Inventory fetch returned no items.');
      return staticRoutes;
    }

    const inventoryRoutes: MetadataRoute.Sitemap = inventory.map((car) => ({
      url: `${SITE_URL}/v/${generateVehicleSlug(car)}/${car.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...inventoryRoutes];
  } catch (error) {
    console.error('🚨 Sitemap Critical Error:', error);
    return staticRoutes;
  }
}
