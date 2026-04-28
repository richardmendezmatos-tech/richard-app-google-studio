import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SupabaseInventoryRepository } from '../src/entities/inventory/api/SupabaseInventoryRepository';
import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';
import { ReconciliationEngine } from '../src/features/inventory-sync/model/ReconciliationEngine';
import { RunInventorySyncUseCase } from '../src/features/inventory-sync/model/RunInventorySyncUseCase';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSync() {
  console.log('--- Running Local Sync Test ---');
  const repository = new SupabaseInventoryRepository(supabase);
  const extractor = new RestApiExtractorAdapter();
  const engine = new ReconciliationEngine();
  
  const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

  try {
    const result = await useCase.execute({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/'
      ],
      useStealthMode: false // Local test
    });

    console.log('Sync Result:', JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error('Sync Error:', e.message);
  }
}

runSync();
