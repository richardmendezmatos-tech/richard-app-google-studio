import { SupabaseSaleRepository } from './repositories/SupabaseSaleRepository';

/**
 * Transacción Atómica "Venta Blindada" - Migrada a Supabase
 * Garantiza que:
 * 1. El vehículo esté disponible.
 * 2. Se marque como 'PENDING'.
 * 3. Se cree el lead/aplicación ligado al auto.
 */
export const executeSecureSale = async (carId: string, leadData: any, dealerId: string) => {
  try {
    const repository = new SupabaseSaleRepository();
    const result = await repository.executeSecureSale(carId, leadData, dealerId);

    console.log('✅ Transacción de venta completada con éxito');
    return result;
  } catch (error: any) {
    console.error('❌ Fallo en transacción de venta:', error);
    return { success: false, error: error.message };
  }
};
