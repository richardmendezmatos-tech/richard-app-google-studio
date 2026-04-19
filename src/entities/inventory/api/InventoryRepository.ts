// src/entities/inventory/api/InventoryRepository.ts
import { Vehicle } from '../model/sync/Vehicle';
import { Car } from '../model/types';

export interface InventoryRepository {
  // --- FRONTEND METHODS ---
  getInventory(dealerId: string, limit: number): Promise<Car[]>;
  getCarById(id: string): Promise<Car | null>;
  getInventoryTurnover(dealerId: string): Promise<number>;

  // --- SYNC ENGINE METHODS ---
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
