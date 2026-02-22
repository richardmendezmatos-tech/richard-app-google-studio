import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { SITE_CONFIG } from '../src/constants/siteConfig';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const baseUrl = (process.env.SITE_URL || SITE_CONFIG.url).replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

type SitemapEntry = {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  lastmod?: string;
  images?: string[];
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

const resolveServiceAccountPath = () => {
  const candidates = [
    path.join(ROOT, 'functions', 'serviceAccountKey.json'),
    path.join(ROOT, 'serviceAccountKey.json')
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const toIsoDate = (value: unknown) => {
  if (!value || typeof value !== 'object') return today;

  const maybeDate = value as { toDate?: () => Date };
  if (typeof maybeDate.toDate === 'function') {
    return maybeDate.toDate().toISOString().slice(0, 10);
  }

  return today;
};

const normalizeImageUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${baseUrl}${value}`;
  return `${baseUrl}/${value}`;
};

const loadVehicleEntries = async (): Promise<SitemapEntry[]> => {
  const serviceAccountPath = resolveServiceAccountPath();
  if (!serviceAccountPath) {
    console.warn('[sitemap] Service account not found. Skipping vehicle URLs.');
    return [];
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const snapshot = await admin.firestore().collection('cars').get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      img?: string;
      images?: string[];
      updatedAt?: unknown;
      createdAt?: unknown;
    };

    const images = [...new Set(
      [data.img, ...(data.images || [])]
        .map((image) => normalizeImageUrl(image))
        .filter((image): image is string => Boolean(image))
    )];

    return {
      loc: `${baseUrl}/vehicle/${doc.id}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: toIsoDate(data.updatedAt || data.createdAt),
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

const buildXml = (urls: SitemapEntry[]) => {
  const entries = urls
    .map((item) => {
      const imageTags = (item.images || [])
        .slice(0, 10)
        .map((image) => `\n    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
        .join('');

      return `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${item.lastmod || today}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority.toFixed(1)}</priority>${imageTags}\n  </url>`;
    })
    .join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n${entries}\n\n</urlset>\n`;
};

const run = async () => {
  const vehicleEntries = await loadVehicleEntries();
  const urls = dedupeByLoc([...staticUrls, ...vehicleEntries]);

  const xml = buildXml(urls);
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`[sitemap] Wrote ${OUTPUT_PATH} with ${urls.length} URLs.`);
};

run().catch((error) => {
  console.error('[sitemap] Failed:', error);
  process.exit(1);
});
