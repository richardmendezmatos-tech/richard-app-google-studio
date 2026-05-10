import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';
import { Car } from '@/entities/inventory';

/**
 * GET /api/distribution/facebook-feed
 * Genera un feed XML dinámico para el Catálogo de Autos de Meta (Facebook Marketplace).
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

  // Construcción del XML Feed (Automotive Standard)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <title>Richard Automotive Inventory Feed</title>
  <link>https://richard-automotive.com</link>
  <description>Inventario actualizado de Richard Automotive</description>
  `;

  cars.forEach(car => {
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
    <exterior_color>${car.color}</exterior_color>
    <state_of_vehicle>${car.condition === 'new' ? 'new' : 'used'}</state_of_vehicle>
    <url>https://richard-automotive.com/inventory/${car.id}</url>
    <image>
      <url>${car.image}</url>
    </image>
    <fb_page_id>RICHARD_AUTOMOTIVE_FB_ID</fb_page_id>
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
