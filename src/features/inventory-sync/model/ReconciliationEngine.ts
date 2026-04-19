// src/features/inventory-sync/application/services/ReconciliationEngine.ts
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';

export interface ReconciliationResult {
  inserts: Vehicle[];
  updates: Vehicle[];
  markAsSoldVins: string[];
}

export class ReconciliationEngine {
  /**
   * Compara el Snapshot actual de la DB contra el Snapshot Extraído de la Web.
   * Funciona como una máquina de estados pura (O(N)).
   */
  public calculateDiff(dbState: Vehicle[], webState: Vehicle[]): ReconciliationResult {
    // 1. Indexar para O(1) Lookups
    const dbMap = new Map<string, Vehicle>();
    dbState.forEach(v => dbMap.set(v.vin, v));

    const webMap = new Map<string, Vehicle>();
    webState.forEach(v => webMap.set(v.vin, v));

    const result: ReconciliationResult = {
      inserts: [],
      updates: [],
      markAsSoldVins: []
    };

    // 2. Encontrar Nuevos & Cambios
    for (const [webVin, webVehicle] of webMap.entries()) {
      const dbVehicle = dbMap.get(webVin);

      if (!dbVehicle) {
        // No existe en DB -> Es Nuevo (INSERT)
        result.inserts.push(webVehicle);
      } else {
        // Existe en ambos -> Revisamos si cambió de precio u estado crítico
        const priceChanged = dbVehicle.price !== webVehicle.price;
        // const specsChanged = ... (se puede añadir hashing o deep equal si se requiere)
        
        if (priceChanged) {
          // Si mutamos estado, usamos métodos de dominio 
          // Importante: Aquí podríamos instanciar un nuevo Vehicle con priceUpdated para no mutar 
          // dependiendo la adherencia estricta a inmutabilidad, o sencillamente invocar `updatePrice`.
          dbVehicle.updatePrice(webVehicle.price);
          result.updates.push(dbVehicle);
        }
      }
    }

    // 3. Encontrar Unidades Vendidas
    // Si estaba en la DB y ya NO está en la web -> SOLD (o transferido a otro dealer)
    for (const [dbVin] of dbMap.entries()) {
      if (!webMap.has(dbVin)) {
        result.markAsSoldVins.push(dbVin);
      }
    }

    return result;
  }
}
