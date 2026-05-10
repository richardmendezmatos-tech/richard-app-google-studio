
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';




/**
 * POST /api/inventory/ingest
 * 
 * Receives a vehicle payload and auto-generates:
 * 1. Semantic Embedding (for matching)
 * 2. Sales Pitch (persuasive ad copy)
 * 3. Ideal Buyer Profile (targeting metadata)
 * 
 * Security: Requires X-Antigravity-Token header.
 */
export async function POST(req: Request) {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Ingest API] Supabase keys missing. Aborting.');
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const token = req.headers.get('x-antigravity-token');
    if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await req.json();

    if (!vehicle.id || !vehicle.name) {
      return NextResponse.json({ error: 'Missing vehicle id or name' }, { status: 400 });
    }

    // 1. Build semantic content string for embedding
    const semanticContent = buildSemanticContent(vehicle);

    // 2. Step 1: Generate Embedding
    const embedding = await sentinelAI.generateEmbedding(semanticContent);

    // 3. Step 2: Generate Intelligence (Pitch & Buyer)
    let salesPitch = '';
    let idealBuyer = '';

    try {
      const intel = await sentinelAI.generateInventoryIntelligence(semanticContent);
      salesPitch = intel.salesPitch;
      idealBuyer = intel.idealBuyer;
    } catch (aiErr) {
      console.error('[Ingest] Intelligence generation failed, falling back:', aiErr);
    }

    // 4. Upsert into Supabase (vehicle_embeddings table) - Requires SERVICE_ROLE_KEY
    const { error: upsertError } = await supabase
      .from('vehicle_embeddings')
      .upsert(
        {
          car_id: vehicle.id,
          car_name: vehicle.name,
          content: semanticContent,
          embedding,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          status: vehicle.status || 'available',
          sales_pitch: salesPitch,
          ideal_buyer: idealBuyer,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'car_id' },
      );

    if (upsertError) {
      console.error('[Ingest] Supabase upsert failed (Check SUPABASE_SERVICE_ROLE_KEY):', upsertError);
      // We don't return here yet, we try to sync with Data Connect too
    }

// 5. Removed Data Connect sync since we are migrating exclusively to Supabase

    return NextResponse.json({
      success: true,
      car_id: vehicle.id,
      intel: { sales_pitch: !!salesPitch, ideal_buyer: !!idealBuyer },
      supabase_sync: !upsertError,
    });
  } catch (error: any) {
    console.error('[Ingest] Pipeline Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/inventory/ingest
 * Bulk sync: pulls all inventory from Java backend
 */
export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Ingest API:Bulk] Supabase keys missing. Aborting.');
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const token = req.headers.get('x-antigravity-token');
    if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const javaUrl = process.env.JAVA_BACKEND_URL || 'https://api-java-gcp.richard-automotive.com';
    const res = await fetch(`${javaUrl}/v1/inventory?limit=100`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': process.env.INTERNAL_API_KEY || '',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Java backend unreachable' }, { status: 502 });
    }

    const inventory = await res.json();
    if (!Array.isArray(inventory)) {
      return NextResponse.json({ error: 'Invalid inventory format' }, { status: 502 });
    }

    // Use a sequential loop to avoid hitting OpenAI rate limits during bulk
    let processed = 0;
    let failed = 0;
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    for (const vehicle of inventory) {
      try {
        const internalRes = await fetch(`${baseUrl}/api/inventory/ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-antigravity-token': 'client-internal',
          },
          body: JSON.stringify(vehicle),
        });

        if (internalRes.ok) processed++;
        else failed++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ success: true, total: inventory.length, processed, failed });
  } catch (error: any) {
    console.error('[Ingest:Bulk] Pipeline Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildSemanticContent(v: any): string {
  const parts = [
    `${v.year} ${v.make} ${v.model}`,
    v.trim && `Versión ${v.trim}`,
    v.type && `Tipo: ${v.type}`,
    v.color && `Color: ${v.color}`,
    v.price && `Precio: $${Number(v.price).toLocaleString()}`,
    v.mileage && `Millaje: ${Number(v.mileage).toLocaleString()} millas`,
    v.transmission && `Transmisión: ${v.transmission}`,
    v.description,
    v.features?.length && `Características: ${v.features.join(', ')}`,
  ];
  return parts.filter(Boolean).join('. ');
}
