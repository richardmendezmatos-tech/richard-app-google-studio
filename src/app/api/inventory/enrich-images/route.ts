import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getEnrichedImageUrl, isRealImage } from '@/shared/lib/utils/carImageEnricher';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/inventory/enrich-images
 * Admin-only endpoint that scans inventory for vehicles without real images
 * and fills them with professional marketing photos from imagin.studio.
 *
 * Body: { secret: string, limit?: number, dryRun?: boolean }
 */
export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminSecret = process.env.ANTIGRAVITY_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  if (adminSecret && body.secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.min(body.limit || 50, 200);
  const dryRun = body.dryRun === true;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch cars that have no images or only placeholder
  const { data: cars, error } = await supabase
    .from('inventory')
    .select('id, vin, make, model, year, images')
    .or('images.is.null,images.eq.{}')
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!cars?.length) {
    return NextResponse.json({ message: 'No cars need image enrichment', enriched: 0 });
  }

  let enriched = 0;
  let skipped = 0;
  const results: { id: string; name: string; imageUrl: string | null; action: string }[] = [];

  for (const car of cars) {
    const existing = car.images?.[0];
    if (isRealImage(existing)) {
      skipped++;
      continue;
    }

    const imageUrl = getEnrichedImageUrl(car.year, car.make, car.model);
    if (!imageUrl) {
      results.push({ id: car.id || car.vin, name: `${car.year} ${car.make} ${car.model}`, imageUrl: null, action: 'no_match' });
      skipped++;
      continue;
    }

    if (!dryRun) {
      await supabase
        .from('inventory')
        .update({ images: [imageUrl] })
        .eq('id', car.id)
        .throwOnError();
    }

    results.push({
      id: car.id || car.vin,
      name: `${car.year} ${car.make} ${car.model}`,
      imageUrl,
      action: dryRun ? 'dry_run' : 'enriched',
    });
    enriched++;
  }

  return NextResponse.json({
    message: dryRun
      ? `Dry run: ${enriched} cars would be enriched`
      : `Enriched ${enriched} cars, skipped ${skipped}`,
    enriched,
    skipped,
    results,
  });
}
