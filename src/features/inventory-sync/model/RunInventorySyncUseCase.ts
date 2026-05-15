// src/features/inventory-sync/application/use-cases/RunInventorySyncUseCase.ts
import { InventoryRepository } from '@/entities/inventory/api/InventoryRepository';
import { WebExtractorPort, ExtractorConfig } from '@/shared/api/scrapers/WebExtractorPort';
import { ReconciliationEngine } from './ReconciliationEngine';
import { ProactiveInventoryBroadcaster } from './ProactiveInventoryBroadcaster';

export class RunInventorySyncUseCase {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly extractor: WebExtractorPort,
    private readonly engine: ReconciliationEngine
  ) {}

  public async execute(config: ExtractorConfig): Promise<{
    status: 'SUCCESS' | 'FAILED';
    inserted: number;
    updated: number;
    sold: number;
    error?: string;
  }> {
    try {
      // 1. Obtener estado actual (Snapshot DB)
      const currentInventory = await this.repository.getActiveInventory();

      // 2. Extraer estado remoto (Snapshot Web)
      // Este proceso puede tomar varios minutos si usa deep sync o delay pagination
      const webInventory = await this.extractor.extractFullInventory(config);

      if (!webInventory || webInventory.length === 0) {
        throw new Error('Extracción vacía. Abortando sincronización por seguridad (Anti-Wipeout Protection).');
      }

      // 3. Reconciliación Pura (Memoria O(N))
      const diff = this.engine.calculateDiff(currentInventory, webInventory);

      // 3.5. Enriquecimiento de Inteligencia (Telemetry Data)
      // Recuperamos métricas de los últimos 7 días para priorizar unidades "Hot"
      const { getRecentVelocityMetrics } = await import('@/entities/inventory/api/adapters/inventoryService');
      const metrics = await getRecentVelocityMetrics(7);
      
      diff.inserts = this.engine.enrichWithVelocity(diff.inserts, metrics);
      diff.updates = this.engine.enrichWithVelocity(diff.updates, metrics);

      // 4. Efectuar cambios en infraestructura (Base de Datos)
      // Se ejecutan en paralelo o de manera secuencial dependiendo de las restricciones del ORM
      await Promise.all([
        this.repository.insertBatch(diff.inserts),
        this.repository.updateBatch(diff.updates),
        this.repository.markAsSoldBatch(diff.markAsSoldVins),
      ]);

      // 5. Difusión Proactiva Automatizada (WhatsApp a Leads afines)
      // Disparo asíncrono para no demorar la culminación de la sincronización
      const broadcaster = new ProactiveInventoryBroadcaster();
      broadcaster.broadcast(diff.inserts, diff.updates).catch(err => {
        console.error('[RunInventorySyncUseCase] Fallo en la difusión proactiva:', err);
      });

      return {
        status: 'SUCCESS',
        inserted: diff.inserts.length,
        updated: diff.updates.length,
        sold: diff.markAsSoldVins.length,
      };

    } catch (error: any) {
      console.error('[RunInventorySyncUseCase] Error Crítico:', error);
      return {
        status: 'FAILED',
        inserted: 0,
        updated: 0,
        sold: 0,
        error: error.message,
      };
    }
  }
}
