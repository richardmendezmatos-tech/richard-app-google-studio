// src/features/inventory-sync/application/use-cases/RunInventorySyncUseCase.ts
import { InventoryRepository } from '@/entities/inventory/api/InventoryRepository';
import { WebExtractorPort, ExtractorConfig } from '@/shared/api/scrapers/WebExtractorPort';
import { ReconciliationEngine } from './ReconciliationEngine';

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

      // 4. Efectuar cambios en infraestructura (Base de Datos)
      // Se ejecutan en paralelo o de manera secuencial dependiendo de las restricciones del ORM
      await Promise.all([
        this.repository.insertBatch(diff.inserts),
        this.repository.updateBatch(diff.updates),
        this.repository.markAsSoldBatch(diff.markAsSoldVins),
      ]);

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
