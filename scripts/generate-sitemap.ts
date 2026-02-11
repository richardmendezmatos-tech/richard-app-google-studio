import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { SITE_CONFIG } from '../src/constants/siteConfig';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const baseUrl = SITE_CONFIG.url.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

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
];

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

const loadVehicleUrls = async () => {
  const serviceAccountPath = resolveServiceAccountPath();
  if (!serviceAccountPath) {
    console.warn('[sitemap] Service account not found. Skipping vehicle URLs.');
    return [] as string[];
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const snapshot = await admin.firestore().collection('cars').get();
  return snapshot.docs.map((doc) => `${baseUrl}/vehicle/${doc.id}`);
};

const buildXml = (urls: Array<{ loc: string; changefreq: string; priority: number }>) => {
  const entries = urls
    .map((item) => `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority.toFixed(1)}</priority>\n  </url>`)
    .join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n${entries}\n\n</urlset>\n`;
};

const run = async () => {
  const vehicleUrls = await loadVehicleUrls();
  const vehicleEntries = vehicleUrls.map((loc) => ({
    loc,
    changefreq: 'weekly',
    priority: 0.7
  }));

  const xml = buildXml([...staticUrls, ...vehicleEntries]);
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`[sitemap] Wrote ${OUTPUT_PATH} with ${staticUrls.length + vehicleEntries.length} URLs.`);
};

run().catch((error) => {
  console.error('[sitemap] Failed:', error);
  process.exit(1);
});
