/**
 * EXECUTABLE SCRIPT: Run Full Inventory Synchronization
 * Pulls inventory via RestApiExtractorAdapter from Central Ford and syncs to Supabase.
 */
import { createClient } from '@supabase/supabase-js';
import { SupabaseInventoryRepository } from '../src/entities/inventory/api/SupabaseInventoryRepository';
import { ReconciliationEngine } from '../src/features/inventory-sync/model/ReconciliationEngine';
import { RestApiExtractorAdapter } from '../src/shared/api/scrapers/RestApiExtractorAdapter';
import { RunInventorySyncUseCase } from '../src/features/inventory-sync/model/RunInventorySyncUseCase';

async function executeSync() {
  console.log('🚀 [CLI Sync] Iniciando Sincronización de Inventario Espejo (Central Ford)...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [CLI Sync] Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  try {
    // 1. Instanciar Supabase Client puro de Node
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 2. Inyección de Dependencias
    const repository = new SupabaseInventoryRepository(supabase);
    const extractor = new RestApiExtractorAdapter();
    const engine = new ReconciliationEngine();
    
    const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

    // 3. Ejecutar Extracción y Reconciliación
    console.log('📡 [CLI Sync] Extrayendo inventario directo desde endpoints de Central Ford...');
    const result = await useCase.execute({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/'
      ],
      useStealthMode: false, // Permitir logs completos en CLI
    });

    console.log('\n📊 [CLI Sync] Resultados de Reconciliación:');
    console.log(`   - Estado: ${result.status}`);
    console.log(`   - Unidades Insertadas: ${result.inserted}`);
    console.log(`   - Unidades Actualizadas: ${result.updated}`);
    console.log(`   - Unidades Vendidas (Marcadas): ${result.sold}`);

    if (result.status === 'FAILED') {
      console.error(`❌ [CLI Sync] Fallo durante la sincronización: ${result.error}`);
      process.exit(1);
    } else {
      console.log('✅ [CLI Sync] Sincronización completada exitosamente.');
      process.exit(0);
    }

  } catch (error: any) {
    console.error('❌ [CLI Sync] Error Fatal No Capturado:', error);
    process.exit(1);
  }
}

executeSync();
