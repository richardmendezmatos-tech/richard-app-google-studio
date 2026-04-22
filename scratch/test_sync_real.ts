import { createClient } from '@supabase/supabase-js';
import { SupabaseInventoryRepository } from '../src/entities/inventory/api/SupabaseInventoryRepository';
import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';
import { ReconciliationEngine } from '../src/features/inventory-sync/model/ReconciliationEngine';
import { RunInventorySyncUseCase } from '../src/features/inventory-sync/model/RunInventorySyncUseCase';
import dotenv from 'dotenv';
dotenv.config();

// Note: This script assumes compiled JS or using ts-node/tsx. 
// Since we are in a mixed environment, I'll use tsx if possible or just node with experimental flags.
// Actually, I'll just write the logic in a way that I can run it with `npx tsx`.

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const repo = new SupabaseInventoryRepository(supabase);
  const extractor = new RestApiExtractorAdapter();
  const engine = new ReconciliationEngine();
  const useCase = new RunInventorySyncUseCase(repo, extractor, engine);

  console.log('--- Iniciando Sync de Prueba ---');
  const result = await useCase.execute({
    targetUrls: ['https://centralfordpr.com/wp-json/inv360/v1/vehicles'],
    useStealthMode: true
  });

  console.log('Resultado:', result);
}

run().catch(console.error);
