import { createClient } from '@supabase/supabase-js';
import { SupabaseInventoryRepository } from '../src/entities/inventory/api/SupabaseInventoryRepository';
import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';
import { ReconciliationEngine } from '../src/features/inventory-sync/model/ReconciliationEngine';
import { RunInventorySyncUseCase } from '../src/features/inventory-sync/model/RunInventorySyncUseCase';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try service role first, fallback to anon
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  console.log(`🔗 Connecting to Supabase at: ${supabaseUrl}`);
  console.log(`🔑 Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'}`);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const repo = new SupabaseInventoryRepository(supabase);
  const extractor = new RestApiExtractorAdapter();
  const engine = new ReconciliationEngine();
  const useCase = new RunInventorySyncUseCase(repo, extractor, engine);

  console.log('🚀 --- Iniciando Sync de Prueba ---');
  try {
    const result = await useCase.execute({
      targetUrls: ['https://centralfordpr.com/wp-json/inv360/v1/vehicles'],
      useStealthMode: false
    });

    console.log('✅ Sync completado!');
    console.log('📊 Telemetría:', JSON.stringify(result, null, 2));
    
    // Verificar si realmente se insertó algo
    const { count } = await supabase.from('inventory').select('*', { count: 'exact', head: true });
    console.log(`📈 Registros totales en la tabla 'inventory': ${count}`);

  } catch (error: any) {
    console.error('💥 Error durante el sync:', error.message);
    if (error.message.includes('permission denied') || error.message.includes('violates row-level security')) {
      console.error('💡 TIP: Asegúrate de tener el SUPABASE_SERVICE_ROLE_KEY en tu .env.local o desactivar RLS temporalmente.');
    }
  }
}

run().catch(console.error);
