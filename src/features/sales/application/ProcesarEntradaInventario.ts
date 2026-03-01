import { UnidadTradeIn } from '../domain/TradeIn';
import { SaleRepository } from '../domain/repositories/SaleRepository';
import { raSentinel } from '@/infra/monitoring/raSentinelService';

/**
 * Caso de Uso: Procesar Entrada de Inventario (Trade-In In-Take)
 * Automatiza la creación de una nueva unidad en el inventario de Richard Automotive
 * a partir de una unidad recibida en Trade-In.
 */
export class ProcesarEntradaInventario {
  constructor(private saleRepository: SaleRepository) {}

  async execute(params: { unidad: UnidadTradeIn; vendedorId: string }): Promise<void> {
    const { unidad, vendedorId } = params;

    // TODO: Implementar guardado real en colección 'unidades' o 'inventory'
    // Por ahora, registramos la intención en Sentinel y simulamos éxito
    const operationalScore = raSentinel.calculateOperationalScore('inventory_in_take', unidad);

    await raSentinel.reportActivity({
      type: 'inventory_in_take',
      data: {
        vin: unidad.vin,
        marca: unidad.marca,
        valorTasacion: unidad.valorTasacion,
        vendedorId,
      },
      operationalScore,
    });

    console.log(`[Inventory] Unidad ${unidad.vin} lista para ser ingresada al sistema.`);
  }
}
