// src/features/inventory-sync/domain/repositories/InventoryRepository.ts
import { Vehicle } from '../model/sync/Vehicle';

export interface InventoryRepository {
  /** 
   * Extrae la foto actual (snapshot) base de datos de todas las 
   * unidades que se suponen activas disponibles en el dealer.
   */
  getActiveInventory(): Promise<Vehicle[]>;
  
  /** 
   * Inserta una lista de nuevas unidades capturadas por primera vez en lote. 
   */
  insertBatch(vehicles: Vehicle[]): Promise<void>;
  
  /** 
   * Sincroniza campos mudables de unidades preexistentes (e.g. Price drop).
   */
  updateBatch(vehicles: Vehicle[]): Promise<void>;
  
  /** 
   * Transiciona el estado de unidades que cayeron del escrapeo a "SOLD" u "ARCHIVED" en lote.
   */
  markAsSoldBatch(vins: string[]): Promise<void>;
}
