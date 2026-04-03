import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Simple slugify utility for the backend
function slugify(text: string): string {
  if (!text) return 'auto';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const generateSitemap = onRequest({ timeoutSeconds: 60, memory: '256MiB' }, async (req, res) => {
  try {
    const db = admin.firestore();
    const inventorySnapshot = await db.collection('inventory').get();
    
    // Base URL of the application
    const baseUrl = 'https://richardautomotive.com'; // Adjust if domain is different

    // XML Structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Routes
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/inventory</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/compare</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/sell-trade</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Dynamic Vehicle Routes
    inventorySnapshot.forEach((doc) => {
      const data = doc.data();
      const slug = slugify(data.name || 'car');
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/v/${slug}/${doc.id}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // Cache for 1 hr in browser, 24 hrs in CDN
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});
