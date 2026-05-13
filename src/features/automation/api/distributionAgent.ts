import { Car } from '@/entities/inventory';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { distributionAgent as legacyAgent, Platform } from '@/shared/api/distribution/DistributionAgent';
import { DistributionMapper } from '../lib/DistributionMapper';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

/**
 * Sentinel Autonomous Distribution Agent v3.0
 * 
 * Orchestrates the full lifecycle of inventory syndication:
 * 1. Inventory Scanning
 * 2. AI Copy Generation (Neural Pitch)
 * 3. Channel Distribution
 * 4. Verification & Logging
 */
export class AutonomousDistributionAgent {
  /**
   * Runs a full autonomous distribution cycle for all available units.
   */
  async runCycle(): Promise<{ processed: number; errors: number }> {
    console.log('[Sentinel Distribution] Starting autonomous cycle...');
    
    // 1. Fetch inventory from Supabase
    const { data: cars, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', 'available');

    if (error || !cars) {
      const audit = await getAuditRepository();
      await audit.log({
        type: 'error',
        message: `Failed to fetch inventory for distribution: ${error?.message || 'Empty response'}`,
        source: 'SentinelDistribution'
      });
      console.error('[Sentinel Distribution] Failed to fetch inventory:', error);
      return { processed: 0, errors: 1 };
    }

    const audit = await getAuditRepository();
    await audit.log({
      type: 'info',
      message: `Starting distribution cycle for ${cars.length} units`,
      source: 'SentinelDistribution'
    });

    let processed = 0;
    let errors = 0;

    for (const car of cars) {
      try {
        const result = await this.processUnit(car as unknown as Car);
        if (result) processed++; else errors++;
      } catch (err) {
        console.error(`[Sentinel Distribution] Error processing unit ${car.id}:`, err);
        errors++;
      }
    }

    await audit.log({
      type: 'info',
      message: `Cycle complete. Processed: ${processed}, Errors: ${errors}`,
      source: 'SentinelDistribution',
      metadata: { processed, errors }
    });

    return { processed, errors };
  }

  /**
   * Processes a single unit: generates copy and syncs with platforms.
   */
  async processUnit(car: Car): Promise<boolean> {
    // 1. Validation
    const validation = legacyAgent.validateUnit(car);
    if (!validation.valid) {
      console.warn(`[Sentinel Distribution] Unit ${car.id} skipping:`, validation.missing);
      return false;
    }

    // 2. Check if already distributed recently (Heuristic: 24h)
    const status = await legacyAgent.getStatus(car.id);
    const platformsToSync: Platform[] = ['facebook_marketplace', 'clasificados_online'];

    for (const platform of platformsToSync) {
      const platformStatus = status.find(s => s.platform === platform);
      
      // If active and synced less than 24h ago, skip
      if (platformStatus?.status === 'active' && platformStatus.lastSync) {
        const lastSyncDate = new Date(platformStatus.lastSync).getTime();
        if (Date.now() - lastSyncDate < 24 * 60 * 60 * 1000) {
          continue;
        }
      }

      // 3. Generate Neural Pitch if missing
      if (!car.description || car.description.length < 50) {
        const aiPitch = await this.generateNeuralPitch(car);
        car.description = aiPitch;
        // Optionally update the car record in Supabase
        await supabase.from('inventory').update({ description: aiPitch }).eq('id', car.id);
      }

      // 4. Trigger Sync with Mapped Data
      console.log(`[Sentinel Distribution] Mapping unit ${car.id} for ${platform}...`);
      const mappedData = platform === 'clasificados_online' 
        ? DistributionMapper.toClasificadosOnline(car)
        : DistributionMapper.toFacebook(car);
      
      console.log(`[Sentinel Distribution] Payload ready for ${platform}:`, mappedData);

      const success = await legacyAgent.triggerSync(car, platform);
      const audit = await getAuditRepository();
      await audit.log(
        success ? 'info' : 'error',
        `${success ? 'Synced' : 'Failed to sync'} unit ${car.id} to ${platform}`,
        { carId: car.id, platform, success },
        'SentinelDistribution'
      );
      if (!success) return false;
    }

    return true;
  }

  /**
   * Uses Sentinel AI to generate high-conversion listing copy.
   */
  private async generateNeuralPitch(car: Car): Promise<string> {
    const prompt = `Genera un anuncio de venta irresistible para un ${car.year} ${car.make} ${car.model}. 
    Precio: $${car.price}. Millaje: ${car.mileage}. Condición: ${car.condition}.
    Usa un tono persuasivo, profesional y adaptado al mercado de Puerto Rico (términos como "guagua", "unidad", "trato").
    Incluye un llamado a la acción para contactar a Richard Automotive.`;

    const instruction = 'Eres un copywriter experto en ventas de autos de lujo y certificados.';
    
    try {
      const result = await sentinelAI.quickGen(prompt, instruction);
      return result || `Excelente ${car.make} ${car.model} disponible hoy en Richard Automotive.`;
    } catch (err) {
      return `${car.make} ${car.model} ${car.year} disponible en Richard Automotive. Contáctanos para detalles.`;
    }
  }
}

export const autonomousDistributionAgent = new AutonomousDistributionAgent();
