import { createClient } from '@supabase/supabase-js';
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { RestApiExtractorAdapter } from '@/shared/api/scrapers/RestApiExtractorAdapter';
import { ReconciliationEngine } from '@/features/inventory-sync/model/ReconciliationEngine';
import { RunInventorySyncUseCase } from '@/features/inventory-sync/model/RunInventorySyncUseCase';
import { NeuralSourcingService } from '@/features/houston/api/NeuralSourcingService';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[scripts/sync-inventory] Missing Supabase credentials');
  process.exit(1);
}

async function runSync() {
  const telemetry: Record<string, any> = { timestamp: new Date().toISOString() };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const repository = new SupabaseInventoryRepository(supabase);
    const extractor = new RestApiExtractorAdapter();
    const engine = new ReconciliationEngine();
    const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

    const result = await useCase.execute({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/',
      ],
      useStealthMode: true,
    });

    telemetry.sync = {
      inserted: result.inserted,
      updated: result.updated,
      sold: result.sold,
    };

    if (result.status === 'FAILED') {
      console.error('[scripts/sync-inventory] Sync failed:', result.error);
    } else {
      console.log('[scripts/sync-inventory] Sync OK:', JSON.stringify(telemetry.sync));
    }
  } catch (error: any) {
    console.error('[scripts/sync-inventory] Sync error:', error);
    telemetry.sync = { error: error.message };
  }

  try {
    const neural = await NeuralSourcingService.processRecentGaps();
    telemetry.neuralSourcing = { processed: neural.processed, success: neural.success };
    console.log('[scripts/sync-inventory] Neural sourcing:', neural.processed, 'gaps processed');
  } catch (neuralError: any) {
    console.error('[scripts/sync-inventory] Neural sourcing error:', neuralError);
    telemetry.neuralSourcing = { error: neuralError.message };
  }

  console.log('[scripts/sync-inventory] Done:', JSON.stringify(telemetry));
}

runSync().catch((err) => {
  console.error('[scripts/sync-inventory] Fatal:', err);
  process.exit(1);
});
