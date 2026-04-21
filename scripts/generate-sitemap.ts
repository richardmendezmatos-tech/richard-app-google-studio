import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { SITE_CONFIG } from '../src/shared/config/siteConfig.ts';
import { slugify, generateVehicleSlug } from '../src/shared/lib/utils/seo.ts';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const baseUrl = (process.env.SITE_URL || SITE_CONFIG.url).replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

// Initialize Supabase (Using env vars or placeholders for script)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type SitemapEntry = {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  lastmod?: string;
  images?: Array<{
    url: string;
    title?: string;
    caption?: string;
  }>;
};

const staticUrls = [
  { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
  { loc: `${baseUrl}/trade-in`, changefreq: 'daily', priority: 0.9 },
  { loc: `${baseUrl}/appraisal`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${baseUrl}/qualify`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${baseUrl}/compare`, changefreq: 'monthly', priority: 0.7 },
  { loc: `${baseUrl}/consultant`, changefreq: 'weekly', priority: 0.7 },
  { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: 0.7 },
  { loc: `${baseUrl}/privacidad`, changefreq: 'yearly', priority: 0.3 },
  { loc: `${baseUrl}/terminos`, changefreq: 'yearly', priority: 0.3 }
] satisfies SitemapEntry[];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const normalizeImageUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${baseUrl}${value}`;
  return `${baseUrl}/${value}`;
};

const loadVehicleEntries = async (): Promise<SitemapEntry[]> => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Supabase credentials missing. Skipping vehicle URLs.');
    return [];
  }

  const { data: cars, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('status', 'available');

  if (error || !cars) {
    console.error('[sitemap] Error fetching from Supabase:', error);
    return [];
  }

  return cars.map((car) => {
    const vehicleName = `${car.year} ${car.make} ${car.model}`.trim();
    const slug = generateVehicleSlug({ name: vehicleName });
    
    // Priority: New inventory and priority conditions get higher visibility
    const isNew = car.condition?.toUpperCase() === 'NEW';
    const priority = isNew ? 0.9 : 0.8;

    const images = [...new Set(
      (car.images || [])
        .map((image: string) => normalizeImageUrl(image))
        .filter((image: string): image is string => Boolean(image))
    )].map(url => ({
      url,
      title: `${vehicleName} - Richard Automotive`,
      caption: `Detalles de ${vehicleName}. Calidad certificada y transparencia total en Puerto Rico.`
    }));

    return {
      loc: `${baseUrl}/v/${slug}/${car.vin}`,
      changefreq: 'daily',
      priority,
      lastmod: car.last_scraped_at ? car.last_scraped_at.slice(0, 10) : today,
      images
    };
  });
};

const dedupeByLoc = (entries: SitemapEntry[]) => {
  const map = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    map.set(entry.loc, entry);
  }
  return [...map.values()].sort((a, b) => a.loc.localeCompare(b.loc));
};

const buildXml = (urls: any[]) => {
  const entries = urls
    .map((item) => {
      const imageTags = (item.images || [])
        .slice(0, 10)
        .map((image: any) => `\n    <image:image>\n      <image:loc>${escapeXml(image.url || image)}</image:loc>\n      ${image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : ''}\n      ${image.caption ? `<image:caption>${escapeXml(image.caption)}</image:caption>` : ''}\n    </image:image>`)
        .join('');

      return `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${item.lastmod || today}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority.toFixed(1)}</priority>${imageTags}\n  </url>`;
    })
    .join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n${entries}\n\n</urlset>\n`;
};

const loadClusterEntries = async (): Promise<SitemapEntry[]> => {
  const locations = ['Bayamon', 'San Juan', 'Guaynabo', 'Carolina', 'Caguas', 'Ponce', 'Mayaguez', 'Dorado'];
  const categories = ['suv', 'sedan', 'coupe', 'hatchback', 'performance', 'luxury'];

  const entries: SitemapEntry[] = [];

  for (const location of locations) {
    const locSlug = location.toLowerCase().replace(/\s+/g, '-');

    // Base location URL
    entries.push({
      loc: `${baseUrl}/comprar/${locSlug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: today
    });

    // Category specific location URLs
    for (const cat of categories) {
      entries.push({
        loc: `${baseUrl}/comprar/${locSlug}/${cat}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: today
      });
    }
  }

  return entries;
};

const run = async () => {
  const vehicleEntries = await loadVehicleEntries();
  const clusterEntries = await loadClusterEntries();
  const urls = dedupeByLoc([...staticUrls, ...vehicleEntries, ...clusterEntries]);

  const xml = buildXml(urls);
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`[sitemap] Wrote ${OUTPUT_PATH} with ${urls.length} URLs.`);
};

run().catch((error) => {
  console.error('[sitemap] Failed:', error);
  process.exit(1);
});
