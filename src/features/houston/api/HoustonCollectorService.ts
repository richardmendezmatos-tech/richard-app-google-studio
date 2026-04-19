import { DI } from '@/app/(dashboard)/di/registry';
import { HoustonTelemetry } from '@/entities/houston/model/types';

/**
 * HoustonCollectorService
 * Orchestrates the collection of real-time metrics for Nivel 13/14 telemetry.
 */
export class HoustonCollectorService {
  private static instance: HoustonCollectorService;
  private intervalId: any = null;

  private constructor() {}

  static getInstance(): HoustonCollectorService {
    if (!HoustonCollectorService.instance) {
      HoustonCollectorService.instance = new HoustonCollectorService();
    }
    return HoustonCollectorService.instance;
  }

  async collectAndPush(dealerId: string): Promise<void> {
    try {
      const leadRepo = DI.getLeadRepository();
      const { createClient } = await import('@supabase/supabase-js');
      const { SupabaseInventoryRepository } = await import('@/entities/inventory/api/SupabaseInventoryRepository');
      const inventoryRepo = new SupabaseInventoryRepository(
         createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
      );
      const houstonRepo = new (await import('@/entities/houston/api/FirestoreHoustonRepository')).FirestoreHoustonRepository();
      const { NeuroScoringService } = await import('../lib/NeuroScoringService');

      // 1. Lead Velocity (Leads per hour)
      const velocity = await leadRepo.getLeadVelocity(dealerId, 24);

      // 2. Inventory Turnover Rate (Sold efficiency)
      const turnover = await inventoryRepo.getInventoryTurnover(dealerId);

      // 3. Closure Probability (Predictive AI Score)
      const baseScore = await leadRepo.getAverageAIScore(dealerId);
      // We use neutral profile for global dashboard calibration
      const closureProb = NeuroScoringService.calculateCalibratedProbability(baseScore, 'neutral');

      // 4. Construct Telemetry Update
      const update: Partial<HoustonTelemetry> = {
        systemHealth: 'online',
        metrics: {
          leadVelocity: { 
            label: 'Lead Velocity', 
            value: velocity, 
            unit: 'LPH', 
            status: velocity > 5 ? 'healthy' : 'warning' 
          },
          inventoryTurnover: { 
            label: 'Inventory Turnover', 
            value: turnover, 
            unit: '%', 
            status: turnover > 20 ? 'healthy' : 'warning' 
          },
          closureProbability: { 
            label: 'Closure Prob', 
            value: closureProb, 
            unit: '%', 
            status: NeuroScoringService.getStatus(closureProb) 
          },
        } as any
      };

      await houstonRepo.pushTelemetry(update);
      console.log(`[Houston:Telemetry] Live Neuro-Sync Push for ${dealerId} | Velocity: ${velocity} | Turnover: ${turnover}% | Closure: ${closureProb}%`);
    } catch (error) {
      console.error('[Houston:Collector] Failed to collect metrics:', error);
    }
  }

  start(dealerId: string, intervalMs: number = 60000): void {
    if (this.intervalId) return;
    this.collectAndPush(dealerId);
    this.intervalId = setInterval(() => this.collectAndPush(dealerId), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
