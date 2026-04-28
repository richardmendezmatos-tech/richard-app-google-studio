import { MetadataRoute } from 'next';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';

const SITE_URL = 'https://richard-automotive.com';
export const revalidate = 86400; // Revalidate sitemap every 24 hours

// ── All PR cities with programmatic pages ──
const SEO_CITIES = [
  'bayamon', 'san-juan', 'guaynabo', 'ponce', 'caguas',
  'carolina', 'mayaguez', 'arecibo', 'toa-baja', 'humacao', 'vega-alta',
];

// ── Vehicle category pages ──
const SEO_CATEGORIES = ['suv', 'sedan', 'pickup', 'luxury', 'economico', 'electrico'];

/**
 * Dynamic Sitemap Generator for Richard Automotive.
 * Indexes: static pages + city pages + category pages + individual vehicles.
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
    {
      url: `${SITE_URL}/financiamiento`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/command-center`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ];

  // Programmatic SEO: City Pages
  const cityRoutes: MetadataRoute.Sitemap = SEO_CITIES.map(city => ({
    url: `${SITE_URL}/autos-usados/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Programmatic SEO: Category Pages
  const categoryRoutes: MetadataRoute.Sitemap = SEO_CATEGORIES.map(cat => ({
    url: `${SITE_URL}/autos-usados/tipo/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Dynamic: Individual Vehicle Pages
  let inventoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const result = await getPaginatedCars(100);
    const inventory = result.cars;

    if (Array.isArray(inventory) && inventory.length > 0) {
      inventoryRoutes = inventory.map((car) => ({
        url: `${SITE_URL}/inventario/${generateVehicleSlug(car)}/${car.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('🚨 Sitemap: Inventory fetch failed:', error);
  }

  // Blog: Index + individual articles
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...SEED_ARTICLES.filter((a) => a.slug).map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...inventoryRoutes,
  ];
}
