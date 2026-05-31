/**
 * BACKFILL SCRIPT: Fetch 5+ images per vehicle from Central Ford detail pages.
 *
 * Usage: npx dotenvx run -f .env -- node --loader ts-node/esm scripts/fetch-all-vehicle-images.ts
 *
 * Phases:
 *   1. Fetch all listing pages (admin-ajax) → Map<vin, detailUrl>
 *   2. Query DB for vehicles with < 5 images
 *   3. For each vehicle, fetch detail page, extract images from JSON-LD, update DB
 */
import { createClient } from '@supabase/supabase-js';

const AJAX_URL = 'https://centralfordpr.com/wp-admin/admin-ajax.php';
const LISTING_URLS = [
  { condition: 'New', referer: 'https://centralfordpr.com/inventario-nuevos/' },
  { condition: 'Used', referer: 'https://centralfordpr.com/inventario-usados/' },
];

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'es-419,es;q=0.9',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'X-Requested-With': 'XMLHttpRequest',
  Cookie: 'cookieadmin_consent={"accept":"true"}',
  Origin: 'https://centralfordpr.com',
};

const CDN_IMG_REGEX = /src="https:\/\/apicdn\.inventario360\.com\/img\?src=([^"&]+)/g;

interface VehicleRow {
  vin: string;
  name: string;
  images: string[] | null;
}

// --- Phase 1: Fetch listing pages → build VIN → detail URL map ---
async function buildVinDetailMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const perPage = 100;

  for (const { condition, referer } of LISTING_URLS) {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      console.log(`[Listing] Fetching ${condition} page ${page}...`);

      const formData = new URLSearchParams();
      formData.append('action', 'get_inventory_results_v2');
      formData.append('allFilters[current_page]', page.toString());
      formData.append('allFilters[per_page]', perPage.toString());
      formData.append('allFilters[sort]', 'updated_at');
      formData.append('allFilters[sort_direction]', 'desc');
      formData.append('allFilters[make]', '19');
      formData.append('allFilters[condition]', condition);

      try {
        const res = await fetch(AJAX_URL, {
          method: 'POST',
          headers: { ...FETCH_HEADERS, Referer: referer },
          body: formData.toString(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error('API returned success=false');

        totalPages = json.data.pagination?.total_pages || 1;
        const html: string = json.data.vehicles || '';

        // Extract VIN + detail URL from each card
        const cardRegex =
          /<article[^>]*class="[^"]*inv360VehicleCard[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
        let m: RegExpExecArray | null;
        while ((m = cardRegex.exec(html)) !== null) {
          const article = m[0];
          const vin = article.match(/data-vin="([^"]*)"/)?.[1];
          const detailUrl = article.match(/href="([^"]*\/vehicles\/[^"]+)"/)?.[1];
          if (vin && detailUrl && !map.has(vin)) {
            map.set(vin, detailUrl);
          }
        }
      } catch (err: any) {
        console.error(`[Listing] Error on ${condition} page ${page}:`, err.message);
      }

      page++;
      if (page <= totalPages) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  console.log(`[Listing] Found ${map.size} vehicle detail URLs.`);
  return map;
}

// --- Phase 2: Query DB ---
async function getVehiclesNeedingImages(supabase: any): Promise<VehicleRow[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('vin, name, images')
    .neq('status', 'SOLD');

  if (error) {
    console.error('[DB] Query error:', error.message);
    return [];
  }

  // Filter client-side: cardinality check for array length
  const filtered = (data || []).filter((r: VehicleRow) => {
    const imgs = r.images || [];
    return imgs.length < 5;
  });

  console.log(`[DB] ${filtered.length} vehicles need images (out of ${(data || []).length} total non-sold).`);
  return filtered;
}

// --- Phase 3: Fetch detail page + extract images ---
async function fetchVehicleImages(detailUrl: string): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(detailUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': FETCH_HEADERS['User-Agent'],
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-419,es;q=0.9',
      },
    });

    if (!res.ok) return [];
    const html = await res.text();

    const images = parseJsonLdImages(html) || parseHtmlImages(html);
    return images;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonLdImages(html: string): string[] | null {
  const ldRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;

  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      const graph = parsed['@graph'] || [parsed];
      const carEntry = graph.find((g: any) => g['@type'] === 'Car');
      if (carEntry?.image && Array.isArray(carEntry.image)) {
        return carEntry.image.map((url: string) => {
          const srcMatch = url.match(/[?&]src=([^&]+)/);
          return srcMatch ? decodeURIComponent(srcMatch[1]) : url;
        });
      }
    } catch {
      // skip
    }
  }
  return null;
}

function parseHtmlImages(html: string): string[] {
  const urls = new Set<string>();
  let m: RegExpExecArray | null;
  const regex = new RegExp(CDN_IMG_REGEX.source, 'g');
  while ((m = regex.exec(html)) !== null) {
    try {
      urls.add(decodeURIComponent(m[1]));
    } catch {
      // skip
    }
  }
  return [...urls];
}

// --- Main ---
async function main() {
  console.log('🚀 [Backfill] Starting vehicle image backfill...');
  console.log(`[Backfill] Env: supabase_url=${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Backfill] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Phase 1: Build VIN → detail URL map from listing pages
  console.log('\n=== PHASE 1: Building VIN → detail URL map ===');
  const vinDetailMap = await buildVinDetailMap();

  // Phase 2: Get vehicles needing images
  console.log('\n=== PHASE 2: Querying DB ===');
  const vehicles = await getVehiclesNeedingImages(supabase);
  if (vehicles.length === 0) {
    console.log('[Backfill] No vehicles need images. Done.');
    return;
  }

  // Phase 3: Enrich with detail page images
  console.log('\n=== PHASE 3: Fetching detail page images ===');
  const CONCURRENCY = 5;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < vehicles.length; i += CONCURRENCY) {
    const batch = vehicles.slice(i, i + CONCURRENCY);
    const batchVins = batch.map((v) => v.vin);

    const results = await Promise.allSettled(
      batchVins.map((vin) => {
        const detailUrl = vinDetailMap.get(vin);
        if (!detailUrl) {
          skipped++;
          return Promise.resolve<string[]>([]);
        }
        return fetchVehicleImages(detailUrl);
      }),
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const vehicle = batch[j];

      if (result.status === 'fulfilled' && result.value.length >= 5) {
        const { error } = await supabase
          .from('inventory')
          .update({ images: result.value })
          .eq('vin', vehicle.vin);

        if (error) {
          console.error(`[Backfill] DB update error for ${vehicle.vin}:`, error.message);
          failed++;
        } else {
          updated++;
        }
      } else if (result.status === 'rejected') {
        failed++;
      }
    }

    const progress = Math.min(i + CONCURRENCY, vehicles.length);
    console.log(
      `[Backfill] ${progress}/${vehicles.length} — updated: ${updated}, failed: ${failed}, skipped: ${skipped}`,
    );

    if (i + CONCURRENCY < vehicles.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log('\n=== DONE ===');
  console.log(`Total: ${vehicles.length} vehicles, Updated: ${updated}, Failed: ${failed}, Skipped (no detail URL): ${skipped}`);
}

main().catch(console.error);
