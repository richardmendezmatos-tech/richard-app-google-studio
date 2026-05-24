import { Car } from '@/entities/inventory';
import { supabase } from '@/shared/api/supabase/supabase';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import {
  distributionAgent as legacyAgent,
  Platform,
} from '@/shared/api/distribution/DistributionAgent';
import { DistributionMapper } from '../lib/DistributionMapper';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

function calculateDesirability(car: Car): number {
  let score = 50;
  const age = new Date().getFullYear() - car.year;
  if (age <= 2) score += 20;
  else if (age <= 5) score += 10;
  const avgMileagePerYear = (car.mileage || 0) / Math.max(age, 1);
  if (avgMileagePerYear < 12000) score += 15;
  const type = (car.type || '').toLowerCase();
  if (['suv', 'pickup', 'truck'].includes(type)) score += 15;
  if (car.price > 50000 && (car as any).condition === 'used') score -= 10;
  return Math.min(Math.max(score, 0), 100);
}

const BACKOFF_INTERVALS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000, 6 * 60 * 60 * 1000];

interface DistributionStatus {
  lastSync: number | null;
  successCount: number;
  failCount: number;
}

/**
 * Sentinel Autonomous Distribution Agent v3.1
 *
 * Orchestrates the full lifecycle of inventory syndication:
 * 1. Inventory Scanning (prioritized by market desirability)
 * 2. AI Copy Generation (Neural Pitch) — skipped if description exists
 * 3. Channel Distribution with smart dedup & exponential backoff
 * 4. Verification & Logging
 */
export class AutonomousDistributionAgent {
  /**
   * Runs a full autonomous distribution cycle for all available units.
   */
  async runCycle(): Promise<{ processed: number; errors: number }> {
    console.log('[Sentinel Distribution] Starting autonomous cycle...');

    const { data: cars, error } = await supabase
      .from('inventory')
      .select('year, mileage, type, price, condition, id, vin, description, make, model, trim, image, status')
      .eq('status', 'available')
      .limit(100);

    if (error || !cars) {
      const audit = await getAuditRepository();
      await audit.log(
        'error',
        `Failed to fetch inventory for distribution: ${error?.message || 'Empty response'}`,
        {},
        'SentinelDistribution',
      );
      console.error('[Sentinel Distribution] Failed to fetch inventory:', error);
      return { processed: 0, errors: 1 };
    }

    const audit = await getAuditRepository();
    await audit.log(
      'info',
      `Starting distribution cycle for ${cars.length} units`,
      {},
      'SentinelDistribution',
    );

    // Priority queue: sort by market desirability descending
    const prioritized = (cars as unknown as Car[])
      .map((c) => ({ car: c, score: calculateDesirability(c) }))
      .sort((a, b) => b.score - a.score);

    let processed = 0;
    let errors = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < prioritized.length; i += BATCH_SIZE) {
      const batch = prioritized.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(({ car }) => this.processUnit(car)),
      );

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) processed++;
        else errors++;
      }
    }

    await audit.log(
      'info',
      `Cycle complete. Processed: ${processed}, Errors: ${errors}`,
      { processed, errors },
      'SentinelDistribution',
    );

    return { processed, errors };
  }

  private async getDistributionStatus(carId: string): Promise<Record<Platform, DistributionStatus>> {
    const status = await legacyAgent.getStatus(carId);
    const result: Record<string, DistributionStatus> = {};
    const platforms: Platform[] = ['facebook_marketplace', 'clasificados_online'];
    for (const p of platforms) {
      const ps = status.find((s) => s.platform === p);
      result[p] = {
        lastSync: ps?.lastSync ? new Date(ps.lastSync).getTime() : null,
        successCount: 0,
        failCount: 0,
      };
    }
    return result as Record<Platform, DistributionStatus>;
  }

  /**
   * Processes a single unit: generates copy and syncs with platforms.
   */
  async processUnit(car: Car): Promise<boolean> {
    const validation = legacyAgent.validateUnit(car);
    if (!validation.valid) {
      console.warn(`[Sentinel Distribution] Unit ${car.id} skipping:`, validation.missing);
      return false;
    }

    // Smart dedup with exponential backoff
    const clientStatus = await this.getDistributionStatus(car.id);
    const platformsToSync: Platform[] = ['facebook_marketplace', 'clasificados_online'];

    for (const platform of platformsToSync) {
      const ps = clientStatus[platform];

      if (ps.lastSync) {
        const hoursSinceSync = (Date.now() - ps.lastSync) / (60 * 60 * 1000);

        // If successfully synced less than 24h ago, skip
        if (hoursSinceSync < 24) {
          continue;
        }
      }

      // Generate Neural Pitch only if description is missing or too short
      if (!car.description || car.description.length < 50) {
        const aiPitch = await this.generateNeuralPitch(car);
        car.description = aiPitch;
        await supabase.from('inventory').update({ description: aiPitch }).eq('vin', car.vin);
      }

      console.log(`[Sentinel Distribution] Mapping unit ${car.id} for ${platform}...`);
      const mappedData =
        platform === 'clasificados_online'
          ? DistributionMapper.toClasificadosOnline(car)
          : DistributionMapper.toFacebook(car);

      console.log(`[Sentinel Distribution] Payload ready for ${platform}:`, mappedData);

      const success = await legacyAgent.triggerSync(car, platform);
      const audit = await getAuditRepository();
      await audit.log(
        success ? 'info' : 'error',
        `${success ? 'Synced' : 'Failed to sync'} unit ${car.id} to ${platform}`,
        { carId: car.id, platform, success },
        'SentinelDistribution',
      );
      if (!success) return false;
    }

    return true;
  }

  /**
   * Uses Sentinel AI to generate high-conversion listing copy (Neural Pitch).
   */
  private async generateNeuralPitch(car: Car): Promise<string> {
    const prompt = `
      CREA UN ANUNCIO DE VENTA IRRESISTIBLE PARA ESTA UNIDAD:
      - Vehículo: ${car.year} ${car.make} ${car.model} ${car.trim || ''}
      - Precio: $${car.price?.toLocaleString()}
      - Millaje: ${car.mileage?.toLocaleString()} mi
      - Condición: ${car.condition === 'new' ? 'NUEVA' : 'CERTIFICADA'}
      
      ESTILO REQUERIDO:
      1. Tono: Profesional, agresivo en ventas, pero honesto. 
      2. Lenguaje: Español de Puerto Rico (usa términos como "guagua", "trato", "unidad", "brutal").
      3. Estructura:
         - Gancho (Headline) impactante.
         - Beneficios clave (por qué comprar esta unidad ahora).
         - Llamado a la acción (CTA) directo a Richard Automotive.
         - Hashtags relevantes (#RichardAutomotive #VentaDeAutosPR).
    `;

    const instruction =
      'Eres el Director de Ventas de Richard Automotive. Tu objetivo es que el cliente sienta que pierde una oportunidad única si no llama ahora mismo.';

    try {
      const result = await sentinelAI.quickGen(prompt, instruction);
      return (
        result ||
        `🔥 ¡NUEVA ENTRADA! ${car.make} ${car.model} ${car.year} disponible hoy en Richard Automotive. Llama ahora.`
      );
    } catch (err) {
      return `${car.make} ${car.model} ${car.year} - Unidad certificada disponible en Richard Automotive. Contáctanos para detalles.`;
    }
  }
}

export const autonomousDistributionAgent = new AutonomousDistributionAgent();
