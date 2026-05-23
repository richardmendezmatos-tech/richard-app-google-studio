import { MetadataRoute } from 'next';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

const SITE_URL = SITE_CONFIG.url;
export const revalidate = 86400; // Revalidate sitemap every 24 hours

// ── All PR cities with programmatic pages ──
const SEO_CITIES = [
  'bayamon', 'san-juan', 'guaynabo', 'ponce', 'caguas',
  'carolina', 'mayaguez', 'arecibo', 'toa-baja', 'humacao',
  'vega-alta', 'dorado', 'vega-baja', 'manati', 'hatillo',
  'isabela', 'cabo-rojo', 'aguadilla', 'fajardo', 'trujillo-alto',
  'guayama',
];

// ── Top SEO brands with city pages ──
const SEO_BRANDS = ['ford', 'hyundai', 'toyota', 'honda'];

// ── Top SEO models for programmatic local pages ──
const SEO_MODELS_BY_BRAND: Record<string, string[]> = {
  ford: ['f-150', 'explorer', 'mustang', 'ranger', 'escape', 'edge', 'bronco', 'maverick'],
  hyundai: ['tucson', 'elantra', 'santa-fe', 'palisade'],
  toyota: ['tacoma', 'corolla', 'rav4', 'highlander'],
  honda: ['cr-v', 'civic', 'accord'],
};

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
    {
      url: `${SITE_URL}/inventario`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Programmatic SEO: City Pages
  const cityRoutes: MetadataRoute.Sitemap = SEO_CITIES.map((city) => ({
    url: `${SITE_URL}/autos-usados/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Programmatic SEO: Category Pages
  const categoryRoutes: MetadataRoute.Sitemap = SEO_CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/autos-usados/tipo/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Dynamic: Individual Vehicle Pages
  let inventoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const result = await getPaginatedCars(100, null, 'all');
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

  // Programmatic SEO: Brand + City Pages
  const brandCityRoutes: MetadataRoute.Sitemap = SEO_CITIES.flatMap((city) =>
    SEO_BRANDS.map((brand) => ({
      url: `${SITE_URL}/autos-usados/${city}/${brand}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );

  // Programmatic SEO: Model + City Pages
  const modelCityRoutes: MetadataRoute.Sitemap = SEO_CITIES.flatMap((city) =>
    SEO_BRANDS.flatMap((brand) =>
      (SEO_MODELS_BY_BRAND[brand] || []).map((model) => ({
        url: `${SITE_URL}/autos-usados/${city}/${brand}/${model}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      })),
    ),
  );

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

  return [...staticRoutes, ...cityRoutes, ...categoryRoutes, ...brandCityRoutes, ...modelCityRoutes, ...blogRoutes, ...inventoryRoutes];
}
