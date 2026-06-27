#!/usr/bin/env tsx
/**
 * reindex-inventory.ts
 *
 * Pobla la tabla inventory_vectors con embeddings para todo el inventario activo.
 * Requiere GEMINI_API_KEY y NEXT_PUBLIC_SUPABASE_* en el entorno.
 *
 * Uso:
 *   npx dotenvx run -- tsx scripts/reindex-inventory.ts
 *   npx dotenvx run -- tsx scripts/reindex-inventory.ts --dry-run
 *   npx dotenvx run -- tsx scripts/reindex-inventory.ts --limit 50
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BATCH_SIZE = 10;
const EMBEDDING_MODEL = 'gemini-embedding-2';

function buildCarText(car: Record<string, unknown>): string {
  return [
    `Vehículo: ${car.year} ${car.make} ${car.model}`,
    car.trim ? `Trim: ${car.trim}` : '',
    `Condición: ${car.condition ?? 'used'}`,
    `Precio: $${car.price}`,
    car.mileage ? `Millaje: ${car.mileage}` : '',
    car.body_style ? `Estilo de carrocería: ${car.body_style}` : '',
    car.transmission ? `Transmisión: ${car.transmission}` : '',
    car.engine ? `Motor: ${car.engine}` : '',
    car.drive_train ? `Tracción: ${car.drive_train}` : '',
    car.exterior_color ? `Color exterior: ${car.exterior_color}` : '',
    car.interior_color ? `Color interior: ${car.interior_color}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit=') || args[args.indexOf(a) - 1] === '--limit');
  const limit = limitArg ? parseInt(limitArg.replace('--limit=', ''), 10) : Infinity;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL }, { apiVersion: 'v1' });

  console.log(`🔍 Fetching active inventory${dryRun ? ' [DRY RUN]' : ''}...`);

  const { data: cars, error } = await supabase
    .from('inventory')
    .select('vin, make, model, year, price, mileage, condition, trim, body_style, transmission, engine, drive_train, exterior_color, interior_color')
    .in('status', ['AVAILABLE', 'PENDING'])
    .limit(Number.isFinite(limit) ? limit : 10000);

  if (error) {
    console.error('❌ Failed to fetch inventory:', error.message);
    process.exit(1);
  }

  console.log(`📦 Found ${cars.length} vehicles to index.`);

  let indexed = 0;
  const skipped = 0;
  let failed = 0;

  for (let i = 0; i < cars.length; i += BATCH_SIZE) {
    const batch = cars.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (car) => {
        const text = buildCarText(car as Record<string, unknown>);
        const carName = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`;

        try {
          if (dryRun) {
            console.log(`  [dry] Would index: ${carName}`);
            indexed++;
            return;
          }

          const result = await embeddingModel.embedContent({
            content: { parts: [{ text: text }] },
            outputDimensionality: 768
          });
          const embedding = result.embedding.values;

          const { error: rpcError } = await supabase.rpc('upsert_inventory_vector', {
            p_car_id: car.vin,
            p_car_name: carName,
            p_content: text,
            p_embedding: embedding,
          });

          if (rpcError) throw rpcError;

          console.log(`  ✅ ${carName}`);
          indexed++;
        } catch (err) {
          console.error(`  ❌ ${carName}:`, (err as Error).message);
          failed++;
        }
      }),
    );

    // Respect Gemini free-tier rate limits (1500 req/min)
    if (i + BATCH_SIZE < cars.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n📊 Reindex complete: ${indexed} indexed, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
