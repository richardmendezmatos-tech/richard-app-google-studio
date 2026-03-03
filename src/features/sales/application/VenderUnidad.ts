import { SaleRepository } from '../domain/repositories/SaleRepository';
import { Venta } from '../domain/Venta';

/**
 * Caso de Uso: Vender Unidad
 * Refactorización de 'secureSaleService.ts' siguiendo Clean Architecture.
 * Este archivo encapsula la intención principal de Richard Automotive.
 */
export class VenderUnidad {
  constructor(private saleRepository: SaleRepository) {}

  async execute(params: {
    unidadId: string;
    clienteId: string;
    vendedorId: string;
    pronto: number;
    precioFinal: number;
  }): Promise<{ success: boolean; saleId?: string; error?: string }> {
    // 1. Validar disponibilidad (Regla de Negocio)
    const available = await this.saleRepository.isUnidadAvailable(params.unidadId);
    if (!available) {
      return { success: false, error: 'La unidad ya no está disponible o no existe.' };
    }

    // 2. Ejecutar Transacción Atómica (Venta Blindada)
    try {
      const saleId = await this.saleRepository.executeTransaction({
        ...params,
        metodoPago: params.pronto > 0 ? 'finance' : 'cash',
        status: 'completada',
      });

      return { success: true, saleId };
    } catch (error: any) {
      console.error('Error en VenderUnidad:', error);
      return { success: false, error: 'Error interno al procesar la venta.' };
    }
  }
}
