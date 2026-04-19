// src/features/inventory-sync/domain/ports/WebExtractorPort.ts
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';

export interface ExtractorConfig {
  baseUrl: string;
  maxConcurrency?: number;
  useStealthMode?: boolean;
}

export interface WebExtractorPort {
  /** 
   * Accede a la fuente origen, captura todas las unidades como un Snapshot
   * las higieniza (parsing) y las traduce al modelo del Core Domain puro (`Vehicle`).
   */
  extractFullInventory(config: ExtractorConfig): Promise<Vehicle[]>;
}
