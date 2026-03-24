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

export const generateMerchantFeed = onRequest({ timeoutSeconds: 60, memory: '256MiB' }, async (req, res) => {
  try {
    const db = admin.firestore();
    const inventorySnapshot = await db.collection('inventory').get();
    
    // Base URL of the application
    const baseUrl = 'https://richardautomotive.com'; // Adjust if domain changes

    // RSS 2.0 XML Strict Structure for Google Merchant Center
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Richard Automotive | Inventario Oficial</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Catálogo dinámico de autos usados garantizados en Puerto Rico.</description>\n`;

    inventorySnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip if essential data is missing for Google Merchant strict rules
      if (!data.name || !data.price || !data.img) return;

      const slug = slugify(data.name || 'car');
      const productLink = `${baseUrl}/v/${slug}/${doc.id}`;
      const imageLink = data.img.startsWith('http') ? data.img : `${baseUrl}${data.img}`;
      const availability = 'in_stock';
      const condition = 'used'; // Assuming all are used
      const brand = data.brand || (data.name.split(' ')[0]) || 'Varied';

      xml += `    <item>\n`;
      xml += `      <g:id>${doc.id}</g:id>\n`;
      xml += `      <g:title><![CDATA[${data.name}]]></g:title>\n`;
      xml += `      <g:description><![CDATA[${data.description || 'Auto garantizado en excelentes condiciones. Consulta nuestro inventario en Richard Automotive.'}]]></g:description>\n`;
      xml += `      <g:link>${productLink}</g:link>\n`;
      xml += `      <g:image_link>${imageLink}</g:image_link>\n`;
      xml += `      <g:condition>${condition}</g:condition>\n`;
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:price>${data.price} USD</g:price>\n`; // Note: Google requires currency code
      xml += `      <g:brand><![CDATA[${brand}]]></g:brand>\n`;
      
      // Optional/Recommended
      if (data.type) xml += `      <g:vehicle_type><![CDATA[${data.type}]]></g:vehicle_type>\n`;
      if (data.mileage) xml += `      <g:mileage><g:value>${data.mileage}</g:value><g:unit>miles</g:unit></g:mileage>\n`;
      
      // Always included vehicle specific tag requirement by Google Vehicle listings if enabled
      xml += `      <g:google_product_category>Vehicles &amp; Parts &gt; Vehicles &gt; Motor Vehicles &gt; Cars, Trucks &amp; Vans</g:google_product_category>\n`;
      
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=14400'); // Cache for 1 hr browser, 4 hrs CDN
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating Merchant Feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
});
