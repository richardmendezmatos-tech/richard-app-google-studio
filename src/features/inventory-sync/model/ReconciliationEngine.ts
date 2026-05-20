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
    dbState.forEach((v) => dbMap.set(v.vin, v));

    const webMap = new Map<string, Vehicle>();
    webState.forEach((v) => webMap.set(v.vin, v));

    const result: ReconciliationResult = {
      inserts: [],
      updates: [],
      markAsSoldVins: [],
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

  /**
   * Enriquece las unidades con puntuaciones de 'Hotness' basadas en telemetría real.
   * Esto permite al frontend priorizar visualmente las unidades con alta tracción.
   */
  public enrichWithVelocity(vehicles: Vehicle[], metrics: any[]): Vehicle[] {
    const velocityMap = new Map<string, number>();

    // 1. Agregar pesos de métricas por VIN
    metrics.forEach((m) => {
      const vin = m.data?.vin;
      const weight = m.operational_score || 1;
      if (vin) {
        velocityMap.set(vin, (velocityMap.get(vin) || 0) + weight);
      }
    });

    // 2. Inyectar score en los objetos Vehicle
    return vehicles.map((v) => {
      const score = velocityMap.get(v.vin) || 0;

      // Si el vehículo tiene tracción significativa, marcamos como "HOT"
      if (score >= 5) {
        v.updateMetadata({
          sentinel_status: 'HOT_INVENTORY',
          velocity_weight: score,
          hot_score: score,
        });
      }

      return v;
    });
  }
}
