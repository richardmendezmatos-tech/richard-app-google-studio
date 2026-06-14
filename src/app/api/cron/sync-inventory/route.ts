import { NextResponse } from 'next/server';
import { RunInventorySyncUseCase } from '@/features/inventory-sync/model/RunInventorySyncUseCase';
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { ReconciliationEngine } from '@/features/inventory-sync/model/ReconciliationEngine';
import { RestApiExtractorAdapter } from '@/shared/api/scrapers/RestApiExtractorAdapter';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NeuralSourcingService } from '@/features/houston/api/NeuralSourcingService';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isManual = searchParams.get('manual') === 'true';
  const authHeader = request.headers.get('authorization');

  if (
    process.env.NODE_ENV === 'production' &&
    !isManual &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const telemetry: Record<string, any> = { timestamp: new Date().toISOString() };

  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[CRON Sync] Missing Supabase credentials');
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabaseClient = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* ignore Server Component call */ }
        },
      },
    });

    // — Inventory Sync —
    const repository = new SupabaseInventoryRepository(supabaseClient);
    const extractor = new RestApiExtractorAdapter();
    const engine = new ReconciliationEngine();
    const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

    const result = await useCase.execute({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/',
      ],
      useStealthMode: process.env.NODE_ENV === 'production',
    });

    telemetry.sync = {
      inserted: result.inserted,
      updated: result.updated,
      sold: result.sold,
    };

    if (result.status === 'FAILED') {
      console.error('[CRON Sync] Sync failed:', result.error);
    }

    // — Neural Sourcing (merged from neural-sourcing cron) —
    try {
      const neural = await NeuralSourcingService.processRecentGaps();
      telemetry.neuralSourcing = { processed: neural.processed, success: neural.success };
      console.log('[CRON Sync] Neural sourcing:', neural.processed, 'gaps processed');
    } catch (neuralError: any) {
      console.error('[CRON Sync] Neural sourcing error:', neuralError);
      telemetry.neuralSourcing = { error: neuralError.message };
    }

    return NextResponse.json({ status: 'success', telemetry });
  } catch (error: any) {
    console.error('[CRON Sync] Error fatal:', error);
    return NextResponse.json({ error: 'Error interno del Cron Sync' }, { status: 500 });
  }
}
