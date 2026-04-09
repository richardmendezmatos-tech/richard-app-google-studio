import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

/**
 * POST /api/inventory/ingest
 * 
 * Receives a vehicle payload from the Java backend (or admin panel)
 * and auto-generates a semantic embedding, storing both in Supabase
 * for the Neural Match Engine.
 * 
 * Security: Requires X-Antigravity-Token header.
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-antigravity-token');
    if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await req.json();

    if (!vehicle.id || !vehicle.name) {
      return NextResponse.json({ error: 'Missing vehicle id or name' }, { status: 400 });
    }

    // 1. Build semantic content string for embedding
    const semanticContent = buildSemanticContent(vehicle);

    // 2. Generate embedding via OpenAI
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json({ error: 'AI Engine offline' }, { status: 503 });
    }

    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        input: semanticContent,
        model: 'text-embedding-3-small',
      }),
    });

    if (!embeddingRes.ok) {
      throw new Error(`OpenAI error: ${embeddingRes.statusText}`);
    }

    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data[0].embedding;

    // 3. Upsert into Supabase (vehicle_embeddings table)
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
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'car_id' },
      );

    if (upsertError) {
      console.error('[Ingest] Supabase upsert failed:', upsertError);
      return NextResponse.json({ error: 'Database write failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      car_id: vehicle.id,
      embedding_dimensions: embedding.length,
      semantic_preview: semanticContent.substring(0, 120) + '...',
    });
  } catch (error: any) {
    console.error('[Ingest] Pipeline Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/inventory/ingest
 * 
 * Bulk sync: pulls all inventory from Java backend and 
 * processes each vehicle through the embedding pipeline.
 */
export async function GET(req: Request) {
  try {
    const token = req.headers.get('x-antigravity-token');
    if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN) {
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

    let processed = 0;
    let failed = 0;

    for (const vehicle of inventory) {
      try {
        const internalRes = await fetch(`${getBaseUrl(req)}/api/inventory/ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-antigravity-token': process.env.ANTIGRAVITY_INTERNAL_TOKEN || '',
          },
          body: JSON.stringify(vehicle),
        });

        if (internalRes.ok) {
          processed++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: inventory.length,
      processed,
      failed,
    });
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
    v.fuel && `Combustible: ${v.fuel}`,
    v.fuelType && `Tipo de combustible: ${v.fuelType}`,
    v.engine && `Motor: ${v.engine}`,
    v.hp && `${v.hp} caballos de fuerza`,
    v.description,
    v.features?.length && `Características: ${v.features.join(', ')}`,
  ];
  
  return parts.filter(Boolean).join('. ');
}

function getBaseUrl(req: Request): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
