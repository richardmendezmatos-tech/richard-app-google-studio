import { UnidadTradeIn } from '../domain/TradeIn';
import { SaleRepository } from '../domain/repositories/SaleRepository';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';
import { Result, success, failure } from '@/shared/types/server-domain';
import { createClient } from '@/shared/api/supabase/client';

/**
 * Caso de Uso: Procesar Entrada de Inventario (Trade-In In-Take)
 * Crea la unidad trade-in como nuevo registro en la tabla inventory con
 * dealer_status='pending' y la reporta al sistema operacional (Sentinel).
 */
export class ProcesarEntradaInventario {
  constructor(private saleRepository: SaleRepository) {}

  async execute(params: {
    unidad: UnidadTradeIn;
    vendedorId: string;
  }): Promise<Result<string>> {
    const { unidad, vendedorId } = params;

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('inventory')
        .insert({
          vin: unidad.vin,
          make: unidad.marca,
          model: unidad.modelo,
          year: unidad.anio,
          mileage: unidad.millaje,
          price: unidad.valorTasacion,
          dealer_id: vendedorId,
          dealer_status: 'pending',
          condition: 'used',
          images: [],
          features: { tradeIn: true, deudaPendiente: unidad.deudaPendiente },
        })
        .select('id')
        .single();

      if (error) throw error;

      const inventoryId = data.id as string;

      const operationalScore = raSentinel.calculateBusinessHealthScore(
        'inventory_in_take',
        unidad,
      );

      await raSentinel.reportActivity({
        type: 'inventory_in_take',
        data: {
          inventoryId,
          vin: unidad.vin,
          marca: unidad.marca,
          valorTasacion: unidad.valorTasacion,
          vendedorId,
        },
        operationalScore,
      });

      console.log(`[Inventory] Unidad ${unidad.vin} ingresada como inventory#${inventoryId}.`);
      return success(inventoryId);
    } catch (err) {
      console.error('[ProcesarEntradaInventario] Error:', err);
      return failure(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
