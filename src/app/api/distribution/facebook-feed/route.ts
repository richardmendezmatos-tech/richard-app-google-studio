import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';
import { Car } from '@/entities/inventory';

/**
 * GET /api/distribution/facebook-feed
 * Genera un feed XML dinámico para el Catálogo de Autos de Meta (Facebook Marketplace).
 * Cumple con el estándar "Automotive Catalog" de Meta.
 */
export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('status', 'available');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cars = inventory as Car[];
  const fbPageId = process.env.FB_PAGE_ID || 'RICHARD_AUTOMOTIVE_FB_ID';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://richard-automotive.com';

  // Construcción del XML Feed (Automotive Standard)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <title>Richard Automotive Inventory Feed</title>
  <link>${siteUrl}</link>
  <description>Inventario actualizado de Richard Automotive - Vega Alta, PR</description>
  `;

  cars.forEach(car => {
    // Limpiar descripción para XML
    const description = (car.description || `Hermoso ${car.make} ${car.model} ${car.year} disponible en Richard Automotive.`).replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });

    xml += `
  <listing>
    <vehicle_id>${car.id}</vehicle_id>
    <make>${car.make}</make>
    <model>${car.model}</model>
    <year>${car.year}</year>
    <mileage>
      <value>${car.mileage || 0}</value>
      <unit>MI</unit>
    </mileage>
    <price>${car.price} USD</price>
    <exterior_color>${car.color || 'N/A'}</exterior_color>
    <state_of_vehicle>${car.condition === 'new' ? 'new' : 'used'}</state_of_vehicle>
    <url>${siteUrl}/inventory/${car.id}</url>
    <image>
      <url>${car.image}</url>
    </image>
    <description>${description}</description>
    <body_style>${car.type || 'Other'}</body_style>
    <fuel_type>${car.fuel || car.fuelType || 'Gasoline'}</fuel_type>
    <transmission>${car.transmission || 'Automatic'}</transmission>
    <fb_page_id>${fbPageId}</fb_page_id>
  </listing>`;
  });

  xml += `
</listings>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
