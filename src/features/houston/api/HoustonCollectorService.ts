import { DI } from '@/app/di/registry';
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
      const houstonRepo = new (await import('@/entities/houston/api/FirestoreHoustonRepository')).FirestoreHoustonRepository();

      // 1. Calculate Lead Velocity (Leads in last 24h)
      const velocity = await leadRepo.getLeadVelocity(dealerId, 24);

      // 2. Mock others for now (to be implemented as real repositories grow)
      const inventoryTurnover = 35; // Target: 30-40 days
      const closureProbability = 82; // Calculated from lead scores

      // 3. Construct Telemetry Update
      const update: Partial<HoustonTelemetry> = {
        systemHealth: 'online',
        metrics: {
          leadVelocity: { label: 'Lead Velocity', value: velocity, unit: 'LPH', status: 'healthy' },
          inventoryTurnover: { label: 'Inventory Turnover', value: inventoryTurnover, unit: 'days', status: 'healthy' },
          closureProbability: { label: 'Closure Prob', value: closureProbability, unit: '%', status: 'healthy' },
        } as any // Allow partial metrics updates
      };

      await houstonRepo.pushTelemetry(update);
      console.log(`[Houston:Telemetry] Real-time metrics pushed for ${dealerId}: ${velocity} LPH`);
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
